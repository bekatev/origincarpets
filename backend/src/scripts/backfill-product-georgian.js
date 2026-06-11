const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

function toPlainText(value) {
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

function readMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return {};
  return metadata;
}

async function translateEnToKa(text) {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ka&dt=t&q=${encodeURIComponent(trimmed)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translate failed (${response.status}) for: ${trimmed.slice(0, 80)}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error(`Unexpected translate response for: ${trimmed.slice(0, 80)}`);
  }

  return payload[0]
    .map((segment) => (Array.isArray(segment) ? String(segment[0] ?? '') : ''))
    .join('')
    .trim();
}

function sleep(ms) {
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

    const sourceTitle = (titleField.en || product.title || '').trim();
    const sourceDescription = toPlainText((descriptionField.en || product.description || '').trim());

    const hasKaTitle = Boolean((titleField.ka || titleField.ge || '').trim());
    const hasKaDescription = Boolean((descriptionField.ka || descriptionField.ge || '').trim());

    if (!force && hasKaTitle && hasKaDescription) {
      skipped += 1;
      continue;
    }

    const kaTitle =
      !force && hasKaTitle
        ? (titleField.ka || titleField.ge || '').trim()
        : await translateEnToKa(sourceTitle);
    await sleep(250);

    const kaDescription =
      !force && hasKaDescription
        ? (descriptionField.ka || descriptionField.ge || '').trim()
        : sourceDescription
          ? await translateEnToKa(sourceDescription)
          : '';
    await sleep(250);

    const nextMetadata = {
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
      data: { metadata: nextMetadata }
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
