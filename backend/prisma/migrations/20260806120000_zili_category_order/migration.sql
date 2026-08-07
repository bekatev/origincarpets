-- Category chronology + merge mafrash/saddlebag → decoration, add zili

INSERT INTO "Category" ("id", "name", "slug", "description", "isActive", "sortOrder", "createdAt", "updatedAt")
SELECT
  'categ_decoration_origin_carpets',
  'Decoration',
  'decoration',
  'Decorative woven pieces (saddlebags, mafrash, and related textiles).',
  true,
  60,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" WHERE "slug" = 'decoration'
);

INSERT INTO "Category" ("id", "name", "slug", "description", "isActive", "sortOrder", "createdAt", "updatedAt")
SELECT
  'categ_zili_origin_carpets',
  'Zili',
  'zili',
  'Zili flatwoven textiles.',
  true,
  40,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" WHERE "slug" = 'zili'
);

UPDATE "Category" SET "name" = 'Carpet', "sortOrder" = 10, "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'carpet';
UPDATE "Category" SET "name" = 'Kilim', "sortOrder" = 20, "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'kilim';
UPDATE "Category" SET "name" = 'Soumak', "sortOrder" = 30, "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'soumak';
UPDATE "Category" SET "name" = 'Zili', "sortOrder" = 40, "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'zili';
UPDATE "Category" SET "name" = 'Djidjim', "sortOrder" = 50, "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'djidjim';
UPDATE "Category" SET "name" = 'Decoration', "sortOrder" = 60, "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'decoration';

-- Move products from mafrash + saddlebag into decoration
UPDATE "Product"
SET "categoryId" = (SELECT "id" FROM "Category" WHERE "slug" = 'decoration'),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "categoryId" IN (
  SELECT "id" FROM "Category" WHERE "slug" IN ('mafrash', 'saddlebag')
);

UPDATE "Category"
SET "isActive" = false, "sortOrder" = 900, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" IN ('mafrash', 'saddlebag');

UPDATE "Category"
SET "isActive" = false, "sortOrder" = 80, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'suzani';
