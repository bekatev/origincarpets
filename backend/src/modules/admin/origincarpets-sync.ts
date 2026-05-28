import { createHash } from 'crypto';
import type { PrismaClient } from '@prisma/client';

type LegacyLocalized = {
  en?: string;
  ka?: string;
  ru?: string;
};

type LegacyProduct = {
  _id: string;
  sku?: string;
  identifier?: string;
  title?: LegacyLocalized;
  description?: LegacyLocalized;
  price?: number;
  quantity?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  material?: { title?: LegacyLocalized };
  size?: { title?: LegacyLocalized };
  color?: { title?: LegacyLocalized };
  origin?: {
    country?: { name?: LegacyLocalized; slug?: string };
    region?: LegacyLocalized;
  };
  period?: {
    label?: LegacyLocalized;
    minAge?: number;
    maxAge?: number;
    age?: { title?: LegacyLocalized };
  };
  categories?: Array<{
    title?: LegacyLocalized;
    slug?: string;
    info?: { description?: LegacyLocalized };
  }>;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  originalDimensions?: {
    length?: number;
    width?: number;
  };
  weight?: number;
  prodType?: LegacyLocalized;
  images?: Array<{ url?: string }>;
  thumbnail?: { url?: string };
};

type LegacyPageResponse = {
  items: LegacyProduct[];
  numTotal: number;
};

type SyncMode = 'full' | 'sync';

export type SyncResult = {
  mode: SyncMode;
  totalFetched: number;
  imported: number;
  skipped: number;
  pages: number;
};

const LEGACY_API = 'https://origincarpets.com/api/products';
const LEGACY_ASSET_BASE = 'https://origincarpets.com';
const PAGE_LIMIT = 50;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function pickText(localized?: LegacyLocalized, fallback = '') {
  return localized?.en?.trim() || localized?.ka?.trim() || localized?.ru?.trim() || fallback;
}

function toAssetUrl(raw?: string) {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `${LEGACY_ASSET_BASE}/${raw.replace(/^\/+/, '')}`;
}

function normalizeProductSlug(product: LegacyProduct) {
  const base = product.identifier || product.sku || pickText(product.title) || `legacy-${product._id}`;
  const cleaned = slugify(base);
  if (cleaned) return cleaned;
  return `legacy-${product._id.slice(-10)}`;
}

function computeSyncHash(product: LegacyProduct) {
  const payload = {
    id: product._id,
    sku: product.sku,
    identifier: product.identifier,
    title: product.title,
    description: product.description,
    price: product.price,
    quantity: product.quantity,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    material: product.material?.title,
    size: product.size?.title,
    color: product.color?.title,
    origin: product.origin,
    period: product.period,
    category: product.categories?.[0]?.slug ?? product.categories?.[0]?.title?.en,
    dimensions: product.dimensions,
    originalDimensions: product.originalDimensions,
    weight: product.weight,
    prodType: product.prodType,
    images: product.images?.map((entry) => entry.url),
    thumbnail: product.thumbnail?.url
  };
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

async function fetchLegacyPage(page: number): Promise<LegacyPageResponse> {
  const response = await fetch(`${LEGACY_API}?limit=${PAGE_LIMIT}&page=${page}`);
  if (!response.ok) {
    throw new Error(`Legacy API failed on page ${page}: ${response.status}`);
  }
  return (await response.json()) as LegacyPageResponse;
}

async function upsertCategory(prisma: PrismaClient, product: LegacyProduct) {
  const legacyCategory = product.categories?.[0];
  const name = pickText(legacyCategory?.title, 'Uncategorized');
  const slug = slugify(legacyCategory?.slug || name) || 'uncategorized';
  const description = pickText(legacyCategory?.info?.description, undefined);

  return prisma.category.upsert({
    where: { slug },
    update: { name, description },
    create: { name, slug, description }
  });
}

async function ensureColorAttribute(prisma: PrismaClient) {
  return prisma.productAttribute.upsert({
    where: { code: 'color' },
    update: {},
    create: { code: 'color', name: 'Color' }
  });
}

async function importOne(prisma: PrismaClient, product: LegacyProduct, colorAttributeId: string, mode: SyncMode) {
  const category = await upsertCategory(prisma, product);
  const syncHash = computeSyncHash(product);

  const sku = (product.sku || `legacy-${product._id}`).trim();
  const existing = await prisma.product.findUnique({
    where: { sku },
    select: { id: true, metadata: true }
  });

  if (mode === 'sync' && existing && typeof existing.metadata === 'object' && existing.metadata !== null) {
    const metadata = existing.metadata as Record<string, unknown>;
    if (metadata.legacySyncHash === syncHash) {
      return { imported: false };
    }
  }

  const title = pickText(product.title, `Carpet ${sku}`);
  const description = pickText(product.description, title);
  const slug = normalizeProductSlug(product);
  const price = Number.isFinite(product.price) ? Number(product.price) : 0;
  const width = Number.isFinite(product.dimensions?.width) ? Number(product.dimensions?.width) : undefined;
  const length = Number.isFinite(product.dimensions?.length) ? Number(product.dimensions?.length) : undefined;
  const weight = Number.isFinite(product.weight) ? Number(product.weight) : undefined;

  const originCountry = pickText(product.origin?.country?.name);
  const originRegion = pickText(product.origin?.region);
  const origin = [originCountry, originRegion].filter(Boolean).join(' - ') || undefined;

  const imageUrls = [
    ...new Set(
      [product.thumbnail?.url, ...(product.images?.map((entry) => entry.url) ?? [])]
        .map((value) => toAssetUrl(value))
        .filter((value): value is string => Boolean(value))
    )
  ];

  const upserted = await prisma.product.upsert({
    where: { sku },
    update: {
      title,
      slug,
      description,
      price,
      categoryId: category.id,
      material: pickText(product.material?.title) || undefined,
      sizeLabel: pickText(product.size?.title) || undefined,
      origin,
      widthCm: width ? Math.round(width * 100) : undefined,
      lengthCm: length ? Math.round(length * 100) : undefined,
      weightKg: weight,
      isActive: Boolean(product.isPublished ?? true),
      isFeatured: Boolean(product.isFeatured ?? false),
      metadata: {
        legacySource: 'origincarpets.com',
        legacyId: product._id,
        legacyIdentifier: product.identifier ?? null,
        legacyQuantity: product.quantity ?? null,
        legacySyncHash: syncHash,
        title: product.title ?? null,
        description: product.description ?? null,
        originCountry,
        originRegion,
        period: {
          label: pickText(product.period?.label) || null,
          minAge: product.period?.minAge ?? null,
          maxAge: product.period?.maxAge ?? null,
          ageTitle: pickText(product.period?.age?.title) || null
        },
        productType: pickText(product.prodType) || null,
        originalDimensions: product.originalDimensions ?? null,
        rawDimensions: product.dimensions ?? null
      }
    },
    create: {
      sku,
      slug,
      title,
      description,
      price,
      categoryId: category.id,
      material: pickText(product.material?.title) || undefined,
      sizeLabel: pickText(product.size?.title) || undefined,
      origin,
      widthCm: width ? Math.round(width * 100) : undefined,
      lengthCm: length ? Math.round(length * 100) : undefined,
      weightKg: weight,
      isActive: Boolean(product.isPublished ?? true),
      isFeatured: Boolean(product.isFeatured ?? false),
      metadata: {
        legacySource: 'origincarpets.com',
        legacyId: product._id,
        legacyIdentifier: product.identifier ?? null,
        legacyQuantity: product.quantity ?? null,
        legacySyncHash: syncHash,
        title: product.title ?? null,
        description: product.description ?? null,
        originCountry,
        originRegion,
        period: {
          label: pickText(product.period?.label) || null,
          minAge: product.period?.minAge ?? null,
          maxAge: product.period?.maxAge ?? null,
          ageTitle: pickText(product.period?.age?.title) || null
        },
        productType: pickText(product.prodType) || null,
        originalDimensions: product.originalDimensions ?? null,
        rawDimensions: product.dimensions ?? null
      }
    }
  });

  await prisma.productImage.deleteMany({ where: { productId: upserted.id } });
  if (imageUrls.length) {
    await prisma.productImage.createMany({
      data: imageUrls.map((url, index) => ({
        productId: upserted.id,
        url,
        sortOrder: index,
        isPrimary: index === 0
      }))
    });
  }

  const colorValue = pickText(product.color?.title);
  if (colorValue) {
    await prisma.productAttributeValue.upsert({
      where: {
        productId_attributeId: {
          productId: upserted.id,
          attributeId: colorAttributeId
        }
      },
      update: { value: colorValue },
      create: {
        productId: upserted.id,
        attributeId: colorAttributeId,
        value: colorValue
      }
    });
  }

  return { imported: true };
}

export async function syncOrigincarpetsProducts(prisma: PrismaClient, mode: SyncMode = 'sync'): Promise<SyncResult> {
  const colorAttribute = await ensureColorAttribute(prisma);
  let page = 1;
  let imported = 0;
  let skipped = 0;
  let total = 0;

  while (true) {
    const payload = await fetchLegacyPage(page);
    if (!payload.items.length) break;
    total = payload.numTotal;

    for (const product of payload.items) {
      const result = await importOne(prisma, product, colorAttribute.id, mode);
      if (result.imported) imported += 1;
      else skipped += 1;
    }

    page += 1;
  }

  return {
    mode,
    totalFetched: total,
    imported,
    skipped,
    pages: Math.max(page - 1, 0)
  };
}
