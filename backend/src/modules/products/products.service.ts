import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  CANNOT_PUBLISH_INCOMPLETE_SHIPPING,
  hasCompleteShipping,
  mergeShippingFields,
  PUBLIC_SHIPPABLE_PRODUCT_WHERE,
  resolveProductPublication
} from './shipping-dimensions';
import { readLocalizedFields } from './product-localization';

const PRODUCT_INCLUDE = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  attributes: {
    include: { attribute: true }
  }
};

type LegacyProductMetadata = {
  period?: { label?: string | null; ageTitle?: string | null };
  originCountry?: string | null;
  originRegion?: string | null;
};

function isTruthyFilterFlag(value?: string): boolean {
  return value === '1' || value === 'true' || value === 'yes';
}

function readMetadata(metadata: unknown): LegacyProductMetadata | null {
  if (!metadata || typeof metadata !== 'object') return null;
  return metadata as LegacyProductMetadata;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(query: ListProductsDto) {
    return this.queryProducts(query, true);
  }

  async listAdminProducts(query: ListProductsDto) {
    return this.queryProducts(query, false, 500);
  }

  async getBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE
    });

    if (!product || !product.isActive || !hasCompleteShipping(product)) {
      throw new NotFoundException('Product not found');
    }

    return this.serializeProduct(product);
  }

  async listCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, description: true, sortOrder: true, isActive: true }
    });
  }

  async listFilterOptions() {
    const [categories, products] = await Promise.all([
      this.listCategories(),
      this.prisma.product.findMany({
        where: { isActive: true, ...PUBLIC_SHIPPABLE_PRODUCT_WHERE },
        select: {
          material: true,
          sizeLabel: true,
          origin: true,
          metadata: true,
          attributes: { include: { attribute: true } }
        }
      })
    ]);

    const materials = new Set<string>();
    const sizes = new Set<string>();
    const origins = new Set<string>();
    const colors = new Set<string>();
    const periods = new Set<string>();
    const ages = new Set<string>();

    for (const product of products) {
      if (product.material?.trim()) materials.add(product.material.trim());
      if (product.sizeLabel?.trim()) sizes.add(product.sizeLabel.trim());
      if (product.origin?.trim()) origins.add(product.origin.trim());

      const colorValue = product.attributes.find((entry) => entry.attribute.code === 'color')?.value;
      if (colorValue?.trim()) colors.add(colorValue.trim());

      const metadata = readMetadata(product.metadata);
      if (metadata?.originCountry?.trim()) {
        const country = metadata.originCountry.trim();
        origins.add(country);
        if (metadata.originRegion?.trim()) {
          origins.add(`${country} - ${metadata.originRegion.trim()}`);
        }
      }
      if (metadata?.period?.label?.trim()) periods.add(metadata.period.label.trim());
      if (metadata?.period?.ageTitle?.trim()) ages.add(metadata.period.ageTitle.trim());
    }

    const sortAlpha = (values: Set<string>) => [...values].sort((a, b) => a.localeCompare(b));

    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug
      })),
      materials: sortAlpha(materials),
      sizes: sortAlpha(sizes),
      origins: sortAlpha(origins),
      colors: sortAlpha(colors),
      periods: sortAlpha(periods),
      ages: sortAlpha(ages)
    };
  }

  async listAdminCategories() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, description: true, sortOrder: true, isActive: true }
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0
      }
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.ensureCategoryExists(id);
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {})
      }
    });
  }

  async deleteCategory(id: string) {
    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  async createProduct(dto: CreateProductDto) {
    await this.ensureCategoryExists(dto.categoryId);
    const colorAttribute = dto.color ? await this.getOrCreateColorAttribute() : null;

    const shipping = mergeShippingFields(null, dto);
    const requestedPublished = dto.isPublished !== undefined ? dto.isPublished : dto.isActive;
    const publication = resolveProductPublication({
      shipping,
      requestedPublished,
      isCreate: true
    });
    if (publication.rejectPublish) {
      throw new BadRequestException(CANNOT_PUBLISH_INCOMPLETE_SHIPPING);
    }

    const product = await this.prisma.product.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        sku: dto.sku,
        description: dto.description,
        price: dto.price,
        categoryId: dto.categoryId,
        sizeLabel: dto.size,
        material: dto.material,
        weightKg: dto.weightKg,
        lengthCm: dto.lengthCm,
        widthCm: dto.widthCm,
        heightCm: dto.heightCm,
        isActive: publication.isActive,
        images: dto.images?.length
          ? {
              create: dto.images
                .map((url) => this.normalizeImageUrl(url))
                .filter(Boolean)
                .map((url, index) => ({ url, sortOrder: index, isPrimary: index === 0 }))
            }
          : undefined,
        attributes:
          colorAttribute && dto.color
            ? {
                create: [{ attributeId: colorAttribute.id, value: dto.color }]
              }
            : undefined
      },
      include: PRODUCT_INCLUDE
    });

    return this.serializeProduct(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }
    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const shipping = mergeShippingFields(existing, {
      weightKg: dto.weightKg,
      lengthCm: dto.lengthCm != null ? Math.round(dto.lengthCm) : dto.lengthCm,
      widthCm: dto.widthCm != null ? Math.round(dto.widthCm) : dto.widthCm,
      heightCm: dto.heightCm != null ? Math.round(dto.heightCm) : dto.heightCm
    });
    const requestedPublished =
      dto.isPublished !== undefined
        ? dto.isPublished
        : dto.isActive !== undefined
          ? dto.isActive
          : undefined;
    const publication = resolveProductPublication({
      shipping,
      requestedPublished,
      currentPublished: existing.isActive
    });
    if (publication.rejectPublish) {
      throw new BadRequestException(CANNOT_PUBLISH_INCOMPLETE_SHIPPING);
    }

    const imageUrls =
      dto.images !== undefined
        ? dto.images.map((url) => this.normalizeImageUrl(url)).filter(Boolean)
        : undefined;

    const colorAttribute = dto.color !== undefined ? await this.getOrCreateColorAttribute() : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
          ...(dto.sku !== undefined ? { sku: dto.sku } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.price !== undefined ? { price: dto.price } : {}),
          ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
          ...(dto.size !== undefined ? { sizeLabel: dto.size } : {}),
          ...(dto.material !== undefined ? { material: dto.material } : {}),
          ...(dto.weightKg !== undefined ? { weightKg: dto.weightKg } : {}),
          ...(dto.lengthCm !== undefined ? { lengthCm: Math.round(dto.lengthCm) } : {}),
          ...(dto.widthCm !== undefined ? { widthCm: Math.round(dto.widthCm) } : {}),
          ...(dto.heightCm !== undefined ? { heightCm: Math.round(dto.heightCm) } : {}),
          isActive: publication.isActive
        }
      });

      if (imageUrls !== undefined) {
        await this.replaceProductImages(tx, id, imageUrls);
      }

      if (colorAttribute && dto.color !== undefined) {
        if (!dto.color.trim()) {
          await tx.productAttributeValue.deleteMany({
            where: { productId: id, attributeId: colorAttribute.id }
          });
        } else {
          await tx.productAttributeValue.upsert({
            where: { productId_attributeId: { productId: id, attributeId: colorAttribute.id } },
            update: { value: dto.color.trim() },
            create: { productId: id, attributeId: colorAttribute.id, value: dto.color.trim() }
          });
        }
      }
    });

    const refreshed = await this.prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
    if (!refreshed) {
      throw new NotFoundException('Product not found after update');
    }

    return this.serializeProduct(refreshed);
  }

  async updateProductImages(id: string, images: string[]) {
    await this.ensureProductExists(id);
    const imageUrls = images.map((url) => this.normalizeImageUrl(url)).filter(Boolean);

    await this.prisma.$transaction(async (tx) => {
      await this.replaceProductImages(tx, id, imageUrls);
    });

    const refreshed = await this.prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
    if (!refreshed) {
      throw new NotFoundException('Product not found after image update');
    }

    return this.serializeProduct(refreshed);
  }

  private async replaceProductImages(
    tx: Prisma.TransactionClient,
    productId: string,
    imageUrls: string[]
  ) {
    await tx.productImage.deleteMany({ where: { productId } });
    if (!imageUrls.length) return;
    await tx.productImage.createMany({
      data: imageUrls.map((url, index) => ({
        productId,
        url,
        sortOrder: index,
        isPrimary: index === 0
      }))
    });
  }

  private normalizeImageUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return '';
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const parsed = new URL(trimmed);
        const host = parsed.hostname;
        const isOwnHost =
          host === 'origincarpets.com' ||
          host === 'www.origincarpets.com' ||
          host === 'localhost' ||
          host === '127.0.0.1';
        // Persist site-relative paths so images work across envs / behind nginx.
        if (isOwnHost || parsed.pathname.startsWith('/uploads/')) {
          return parsed.pathname || trimmed;
        }
      }
    } catch {
      return trimmed;
    }
    return trimmed.startsWith('/') ? trimmed : trimmed;
  }

  async deleteProduct(id: string) {
    await this.ensureProductExists(id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  private buildProductWhere(query: ListProductsDto, onlyActive: boolean): Prisma.ProductWhereInput {
    const and: Prisma.ProductWhereInput[] = [];

    if (onlyActive) {
      and.push({ isActive: true, ...PUBLIC_SHIPPABLE_PRODUCT_WHERE });
    }

    if (query.search) {
      and.push({
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { material: { contains: query.search, mode: 'insensitive' } },
          { origin: { contains: query.search, mode: 'insensitive' } }
        ]
      });
    }

    if (query.category) and.push({ category: { slug: query.category } });

    if (query.material) {
      and.push({ material: { equals: query.material, mode: 'insensitive' } });
    }

    if (query.size) {
      and.push({ sizeLabel: { equals: query.size, mode: 'insensitive' } });
    }

    if (query.origin) {
      and.push({ origin: { contains: query.origin, mode: 'insensitive' } });
    }

    if (query.color) {
      and.push({
        attributes: {
          some: {
            attribute: { code: 'color' },
            value: { equals: query.color, mode: 'insensitive' }
          }
        }
      });
    }

    if (query.period) {
      and.push({
        metadata: {
          path: ['period', 'label'],
          equals: query.period
        }
      });
    }

    if (query.age) {
      and.push({
        OR: [
          { metadata: { path: ['period', 'ageTitle'], equals: query.age } },
          { metadata: { path: ['period', 'label'], equals: query.age } }
        ]
      });
    }

    if (isTruthyFilterFlag(query.georgian)) {
      and.push({
        OR: [
          { origin: { contains: 'Georgia', mode: 'insensitive' } },
          { metadata: { path: ['originCountry'], string_contains: 'Georgia', mode: 'insensitive' } },
          { category: { slug: { in: ['georgian', 'georgian-carpets', 'georgian-carpet'] } } },
          { category: { name: { contains: 'Georgian', mode: 'insensitive' } } }
        ]
      });
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      and.push({
        price: {
          ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
          ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {})
        }
      });
    }

    return and.length ? { AND: and } : {};
  }

  private async queryProducts(query: ListProductsDto, onlyActive: boolean, maxLimit = 100) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, maxLimit);

    const where = this.buildProductWhere(query, onlyActive);

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      items: items.map((item) => this.serializeProduct(item)),
      meta: { total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) }
    };
  }

  private async ensureProductExists(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!product) throw new NotFoundException('Product not found');
  }

  private async ensureCategoryExists(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!category) throw new BadRequestException('Invalid categoryId');
  }

  private async getOrCreateColorAttribute() {
    return this.prisma.productAttribute.upsert({
      where: { code: 'color' },
      update: {},
      create: { code: 'color', name: 'Color' }
    });
  }

  private serializeProduct(product: Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>) {
    const colorValue = product.attributes.find((entry) => entry.attribute.code === 'color')?.value ?? null;
    const localized = readLocalizedFields(product.metadata);
    return {
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      title: product.title,
      description: product.description,
      localizations: {
        title: localized.title ?? { en: product.title },
        description: localized.description ?? { en: product.description }
      },
      price: Number(product.price),
      isActive: product.isActive,
      isPublished: product.isActive,
      category: { id: product.category.id, name: product.category.name, slug: product.category.slug },
      origin: product.origin,
      attributes: {
        size: product.sizeLabel,
        material: product.material,
        color: colorValue,
        period: readMetadata(product.metadata)?.period?.label ?? null,
        age: readMetadata(product.metadata)?.period?.ageTitle ?? null
      },
      shipping: {
        weightKg: product.weightKg != null ? Number(product.weightKg) : null,
        lengthCm: product.lengthCm,
        widthCm: product.widthCm,
        heightCm: product.heightCm
      },
      images: product.images.map((image) => image.url),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }
}
