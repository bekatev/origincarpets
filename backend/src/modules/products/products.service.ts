import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const PRODUCT_INCLUDE = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  attributes: {
    include: { attribute: true }
  }
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(query: ListProductsDto) {
    return this.queryProducts(query, true);
  }

  async listAdminProducts(query: ListProductsDto) {
    return this.queryProducts(query, false);
  }

  async getBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE
    });

    if (!product || !product.isActive) {
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
        isActive: dto.isActive ?? true,
        images: dto.images?.length
          ? {
              create: dto.images.map((url, index) => ({ url, sortOrder: index, isPrimary: index === 0 }))
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
    await this.ensureProductExists(id);
    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const colorAttribute = dto.color ? await this.getOrCreateColorAttribute() : null;

    await this.prisma.product.update({
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
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {})
      }
    });

    if (dto.images) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      if (dto.images.length) {
        await this.prisma.productImage.createMany({
          data: dto.images.map((url, index) => ({ productId: id, url, sortOrder: index, isPrimary: index === 0 }))
        });
      }
    }

    if (dto.color !== undefined) {
      if (!colorAttribute) {
        throw new BadRequestException('Color attribute config failed');
      }

      await this.prisma.productAttributeValue.upsert({
        where: { productId_attributeId: { productId: id, attributeId: colorAttribute.id } },
        update: { value: dto.color },
        create: { productId: id, attributeId: colorAttribute.id, value: dto.color }
      });
    }

    const refreshed = await this.prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
    if (!refreshed) {
      throw new NotFoundException('Product not found after update');
    }

    return this.serializeProduct(refreshed);
  }

  async deleteProduct(id: string) {
    await this.ensureProductExists(id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  private async queryProducts(query: ListProductsDto, onlyActive: boolean) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);

    const where: Prisma.ProductWhereInput = {
      ...(onlyActive ? { isActive: true } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              { material: { contains: query.search, mode: 'insensitive' } }
            ]
          }
        : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            price: {
              ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
              ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {})
            }
          }
        : {})
    };

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
    return {
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      isActive: product.isActive,
      category: { id: product.category.id, name: product.category.name, slug: product.category.slug },
      attributes: {
        size: product.sizeLabel,
        material: product.material,
        color: colorValue
      },
      images: product.images.map((image) => image.url),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }
}
