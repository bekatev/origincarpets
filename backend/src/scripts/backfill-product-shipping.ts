import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { legacyMetresToCm, resolveLegacyHeightCm } from '../modules/products/shipping-dimensions';

const LEGACY_API = 'https://origincarpets.com/api/products';
const PAGE_LIMIT = 50;

type LegacyProduct = {
  sku?: string;
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
};

type LegacyPageResponse = {
  items: LegacyProduct[];
  numTotal: number;
};

async function fetchLegacyPage(offset: number) {
  const response = await fetch(`${LEGACY_API}?limit=${PAGE_LIMIT}&offset=${offset}`);
  if (!response.ok) {
    throw new Error(`Legacy API failed (${response.status})`);
  }
  return response.json() as Promise<LegacyPageResponse>;
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const prisma = app.get(PrismaService);

  const first = await fetchLegacyPage(0);
  const bySku = new Map<string, LegacyProduct>();

  for (let offset = 0; offset < first.numTotal; offset += PAGE_LIMIT) {
    const page = offset === 0 ? first : await fetchLegacyPage(offset);
    for (const item of page.items) {
      if (item.sku?.trim()) {
        bySku.set(item.sku.trim(), item);
      }
    }
  }

  const products = await prisma.product.findMany({ select: { id: true, sku: true } });
  let updated = 0;
  let missing = 0;

  for (const product of products) {
    const legacy = bySku.get(product.sku);
    if (!legacy) {
      missing++;
      continue;
    }

    const lengthCm = legacyMetresToCm(legacy.dimensions?.length);
    const widthCm = legacyMetresToCm(legacy.dimensions?.width);
    const heightCm = resolveLegacyHeightCm(legacy.dimensions?.height, lengthCm);
    const weightKg = Number.isFinite(legacy.weight) ? Number(legacy.weight) : undefined;

    if (!lengthCm && !widthCm && !heightCm && weightKg == null) {
      missing++;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        ...(lengthCm != null ? { lengthCm } : {}),
        ...(widthCm != null ? { widthCm } : {}),
        ...(heightCm != null ? { heightCm } : {}),
        ...(weightKg != null ? { weightKg } : {})
      }
    });
    updated++;
  }

  console.log(`Backfill complete: ${updated} updated, ${missing} without legacy shipping data`);
  await app.close();
}

void main();
