declare const process: { exit: (code: number) => void };

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type LegacyMetadata = {
  originCountry?: string | null;
  originRegion?: string | null;
};

function readMetadata(metadata: unknown): LegacyMetadata | null {
  if (!metadata || typeof metadata !== 'object') return null;
  return metadata as LegacyMetadata;
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, origin: true, metadata: true }
  });

  let originUpdated = 0;

  for (const product of products) {
    if (product.origin?.trim()) continue;

    const metadata = readMetadata(product.metadata);
    if (!metadata?.originCountry?.trim()) continue;

    const country = metadata.originCountry.trim();
    const region = metadata.originRegion?.trim();
    const origin = region ? `${country} - ${region}` : country;

    await prisma.product.update({
      where: { id: product.id },
      data: { origin }
    });
    originUpdated += 1;
  }

  console.log(`Backfill complete. Origins set on ${originUpdated} product(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
