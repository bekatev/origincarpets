const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

(async () => {
  const products = await p.product.findMany({
    include: {
      images: { select: { url: true, sortOrder: true } },
      category: { select: { name: true, slug: true } }
    }
  });

  const report = {
    total: products.length,
    active: 0,
    inactive: 0,
    sold: 0,
    withLegacyId: 0,
    withoutLegacyId: 0,
    emptyEnDesc: [],
    emptyKaDesc: [],
    richKaButEmptyEn: [],
    richEnButEmptyStorefront: [],
    noImages: [],
    fewImages: [],
    brokenLookingImages: [],
    genericTitleOnly: [],
    inactiveWithContent: [],
    legacyQuantityZero: [],
    missingKaTitle: [],
    imageUrlHosts: {},
    legacyIds: []
  };

  const genericTitles = new Set([
    'carpet',
    'kilim',
    'suzani',
    'djidjim',
    'mafrash',
    'saddlebag',
    'soumak',
    'sumakh'
  ]);

  for (const prod of products) {
    const meta = prod.metadata && typeof prod.metadata === 'object' ? prod.metadata : {};
    if (prod.isActive) report.active++;
    else report.inactive++;
    if (prod.isSold) report.sold++;

    if (meta.legacyId) {
      report.withLegacyId++;
      report.legacyIds.push(meta.legacyId);
    } else report.withoutLegacyId++;

    const locTitle = meta.title || {};
    const locDesc = meta.description || {};
    const enTitle = (locTitle.en || prod.title || '').trim();
    const kaTitle = (locTitle.ka || locTitle.ge || '').trim();
    const enDesc = stripHtml(locDesc.en || '');
    const kaDesc = stripHtml(locDesc.ka || locDesc.ge || '');
    const storeDesc = stripHtml(prod.description || '');

    if (!kaTitle) report.missingKaTitle.push({ sku: prod.sku, title: prod.title });

    if (genericTitles.has(enTitle.toLowerCase()) && enDesc.length < 20) {
      report.genericTitleOnly.push({
        sku: prod.sku,
        slug: prod.slug,
        title: enTitle,
        kaTitle,
        images: prod.images.length,
        active: prod.isActive,
        category: prod.category?.name
      });
    }

    if (enDesc.length < 5) {
      report.emptyEnDesc.push({ sku: prod.sku, title: prod.title, slug: prod.slug, images: prod.images.length });
    }
    if (kaDesc.length < 5) {
      report.emptyKaDesc.push({ sku: prod.sku, title: prod.title });
    }

    if (kaDesc.length >= 40 && enDesc.length < 5) {
      report.richKaButEmptyEn.push({
        sku: prod.sku,
        title: prod.title,
        kaDesc: kaDesc.slice(0, 160),
        images: prod.images.length
      });
    }
    if (enDesc.length >= 40 && (storeDesc.length < 5 || storeDesc.toLowerCase() === enTitle.toLowerCase())) {
      report.richEnButEmptyStorefront.push({
        sku: prod.sku,
        title: prod.title,
        slug: prod.slug,
        enDesc: enDesc.slice(0, 180),
        kaDesc: kaDesc.slice(0, 120),
        storeDesc: storeDesc.slice(0, 80),
        images: prod.images.length,
        active: prod.isActive,
        category: prod.category?.name
      });
    }

    if (!prod.images.length) {
      report.noImages.push({ sku: prod.sku, title: prod.title, slug: prod.slug });
    } else if (prod.images.length === 1) {
      report.fewImages.push({ sku: prod.sku, title: prod.title, images: 1 });
    }

    for (const img of prod.images) {
      try {
        const host = new URL(img.url.startsWith('http') ? img.url : `https://origincarpets.com${img.url}`)
          .hostname;
        report.imageUrlHosts[host] = (report.imageUrlHosts[host] || 0) + 1;
      } catch {
        report.brokenLookingImages.push({ sku: prod.sku, url: img.url });
      }
      if (!img.url || img.url.includes('undefined') || img.url.includes('null')) {
        report.brokenLookingImages.push({ sku: prod.sku, url: img.url });
      }
    }

    if (meta.legacyQuantity === 0) {
      report.legacyQuantityZero.push({ sku: prod.sku, title: prod.title });
    }
    if (!prod.isActive) {
      report.inactiveWithContent.push({
        sku: prod.sku,
        title: prod.title,
        slug: prod.slug,
        images: prod.images.length,
        enDescLen: enDesc.length,
        kaDescLen: kaDesc.length,
        category: prod.category?.name
      });
    }
  }

  const out = {
    totals: {
      products: report.total,
      active: report.active,
      inactive: report.inactive,
      sold: report.sold,
      withLegacyId: report.withLegacyId,
      withoutLegacyId: report.withoutLegacyId,
      emptyEnDesc: report.emptyEnDesc.length,
      emptyKaDesc: report.emptyKaDesc.length,
      richKaButEmptyEn: report.richKaButEmptyEn.length,
      richEnButEmptyStorefront: report.richEnButEmptyStorefront.length,
      noImages: report.noImages.length,
      singleImage: report.fewImages.length,
      genericTitleThinContent: report.genericTitleOnly.length,
      inactiveWithContent: report.inactiveWithContent.length,
      legacyQtyZero: report.legacyQuantityZero.length,
      imageUrlHosts: report.imageUrlHosts
    },
    inactiveWithContent: report.inactiveWithContent,
    richEnButEmptyStorefront: report.richEnButEmptyStorefront.slice(0, 50),
    richKaButEmptyEn: report.richKaButEmptyEn.slice(0, 40),
    noImages: report.noImages,
    genericTitleOnly: report.genericTitleOnly.slice(0, 50),
    missingKaTitle: report.missingKaTitle.slice(0, 40),
    emptyEnDescSample: report.emptyEnDesc.slice(0, 30),
    brokenLookingImages: report.brokenLookingImages.slice(0, 20),
    legacyIdsCount: report.legacyIds.length
  };

  require('fs').writeFileSync('/tmp/carp-catalog-audit.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out.totals, null, 2));
  console.log('inactive', out.inactiveWithContent.length);
  console.log('richEn hidden', out.richEnButEmptyStorefront.length);
  console.log('wrote /tmp/carp-catalog-audit.json');
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
