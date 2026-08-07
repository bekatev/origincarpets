/**
 * Merge mafrash + saddlebag → decoration, ensure zili exists,
 * and apply storefront category chronology / sortOrder.
 *
 * Usage (from backend/):
 *   npx ts-node -r tsconfig-paths/register scripts/reorder-categories.ts
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/** Public chronology: ხალიჩა, ფარდაგი, სუმახი, ზილი, ჯეჯიმი, დეკორაცია */
const CHRONOLOGY = [
  { slug: 'carpet', name: 'Carpet', sortOrder: 10 },
  { slug: 'kilim', name: 'Kilim', sortOrder: 20 },
  { slug: 'soumak', name: 'Soumak', sortOrder: 30 },
  { slug: 'zili', name: 'Zili', sortOrder: 40 },
  { slug: 'djidjim', name: 'Djidjim', sortOrder: 50 },
  { slug: 'decoration', name: 'Decoration', sortOrder: 60 }
];

const MERGE_INTO_DECORATION = ['mafrash', 'saddlebag'];

async function ensureCategory(slug: string, name: string, sortOrder: number) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, sortOrder, isActive: true },
    create: { slug, name, sortOrder, isActive: true }
  });
}

async function main() {
  const decoration = await ensureCategory('decoration', 'Decoration', 60);
  await ensureCategory('zili', 'Zili', 40);

  for (const { slug, name, sortOrder } of CHRONOLOGY) {
    if (slug === 'decoration' || slug === 'zili') continue;
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      await prisma.category.update({
        where: { slug },
        data: { name, sortOrder, isActive: true }
      });
      console.log(`updated ${slug} sortOrder=${sortOrder}`);
    } else {
      await prisma.category.create({
        data: { slug, name, sortOrder, isActive: true }
      });
      console.log(`created ${slug}`);
    }
  }

  await prisma.category.update({
    where: { id: decoration.id },
    data: { name: 'Decoration', sortOrder: 60, isActive: true }
  });
  await prisma.category.update({
    where: { slug: 'zili' },
    data: { name: 'Zili', sortOrder: 40, isActive: true }
  });

  for (const slug of MERGE_INTO_DECORATION) {
    const source = await prisma.category.findUnique({ where: { slug } });
    if (!source) {
      console.log(`skip merge — ${slug} not found`);
      continue;
    }
    const moved = await prisma.product.updateMany({
      where: { categoryId: source.id },
      data: { categoryId: decoration.id }
    });
    await prisma.category.update({
      where: { id: source.id },
      data: { isActive: false, sortOrder: 900 }
    });
    console.log(`merged ${slug} → decoration (${moved.count} products), deactivated ${slug}`);
  }

  const suzani = await prisma.category.findUnique({ where: { slug: 'suzani' } });
  if (suzani) {
    await prisma.category.update({
      where: { id: suzani.id },
      data: { sortOrder: 80, isActive: false }
    });
    console.log('suzani deactivated (not in public chronology)');
  }

  const all = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      slug: true,
      name: true,
      sortOrder: true,
      isActive: true,
      _count: { select: { products: true } }
    }
  });
  console.log('\nCategories:');
  for (const c of all) {
    console.log(
      `  ${c.sortOrder.toString().padStart(3)} ${c.isActive ? '✓' : '✗'} ${c.slug.padEnd(14)} ${c.name} (${c._count.products})`
    );
  }
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
