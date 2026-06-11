import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type LocalizedField = {
  en?: string | null;
  ka?: string | null;
  ge?: string | null;
};

type ProductMetadata = {
  title?: LocalizedField;
  description?: LocalizedField;
  [key: string]: unknown;
};

function toPlainText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function readMetadata(metadata: unknown): ProductMetadata {
  if (!metadata || typeof metadata !== 'object') return {};
  return metadata as ProductMetadata;
}

async function translateEnToKa(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ka&dt=t&q=${encodeURIComponent(trimmed)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translate failed (${response.status}) for: ${trimmed.slice(0, 80)}`);
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error(`Unexpected translate response for: ${trimmed.slice(0, 80)}`);
  }

  return payload[0]
    .map((segment) => (Array.isArray(segment) ? String(segment[0] ?? '') : ''))
    .join('')
    .trim();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  const products = await prisma.product.findMany({
    select: { id: true, title: true, description: true, metadata: true },
    orderBy: { createdAt: 'asc' },
    ...(limit && Number.isFinite(limit) ? { take: limit } : {})
  });

  let translated = 0;
  let skipped = 0;

  for (const product of products) {
    const metadata = readMetadata(product.metadata);
    const titleField = metadata.title ?? { en: product.title };
    const descriptionField = metadata.description ?? { en: product.description };

    const sourceTitle = titleField.en?.trim() || product.title.trim();
    const sourceDescription = toPlainText(descriptionField.en?.trim() || product.description || '');

    const hasKaTitle = Boolean(titleField.ka?.trim() || titleField.ge?.trim());
    const hasKaDescription = Boolean(descriptionField.ka?.trim() || descriptionField.ge?.trim());

    if (!force && hasKaTitle && hasKaDescription) {
      skipped += 1;
      continue;
    }

    const kaTitle = !force && hasKaTitle ? titleField.ka?.trim() || titleField.ge?.trim() || '' : await translateEnToKa(sourceTitle);
    await sleep(250);

    const kaDescription =
      !force && hasKaDescription
        ? descriptionField.ka?.trim() || descriptionField.ge?.trim() || ''
        : sourceDescription
          ? await translateEnToKa(sourceDescription)
          : '';
    await sleep(250);

    const nextMetadata: ProductMetadata = {
      ...metadata,
      title: { ...titleField, en: sourceTitle, ka: kaTitle },
      description: { ...descriptionField, en: descriptionField.en ?? product.description, ka: kaDescription }
    };

    if (dryRun) {
      console.log(`[dry-run] ${product.id}: ${sourceTitle} -> ${kaTitle}`);
      translated += 1;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { metadata: nextMetadata as Prisma.InputJsonValue }
    });

    translated += 1;
    console.log(`Translated ${translated}/${products.length}: ${sourceTitle}`);
  }

  console.log(`Backfill complete. Translated ${translated}, skipped ${skipped}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
