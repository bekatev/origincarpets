-- Seed the SOUMAK category (idempotent).
INSERT INTO "Category" ("id", "name", "slug", "description", "isActive", "sortOrder", "createdAt", "updatedAt")
SELECT
  'categ_soumak_origin_carpets',
  'SOUMAK',
  'soumak',
  'Soumak (sumakh) flatwoven textiles.',
  true,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" WHERE "slug" = 'soumak'
);
