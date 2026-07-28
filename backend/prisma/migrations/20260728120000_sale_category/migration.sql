-- Seed the SALE category for discounted products (idempotent).
INSERT INTO "Category" ("id", "name", "slug", "description", "isActive", "sortOrder", "createdAt", "updatedAt")
SELECT
  'categ_sale_origin_carpets',
  'SALE',
  'sale',
  'Reduced-price pieces — original and sale pricing set per product.',
  true,
  100,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" WHERE "slug" = 'sale'
);
