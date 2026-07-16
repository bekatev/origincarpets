import type { ProductFilterOptions, ProductItem } from './products';

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((v) => v?.trim()).filter((v): v is string => Boolean(v)))].sort((a, b) =>
    a.localeCompare(b)
  );
}

/** Build filter dropdown options from loaded products when /products/filters is unavailable. */
export function buildFacetsFromProducts(
  categories: ProductFilterOptions['categories'],
  items: ProductItem[]
): ProductFilterOptions {
  const prices = items.map((p) => p.price).filter((price) => Number.isFinite(price) && price >= 0);
  const min = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const maxRaw = prices.length ? Math.max(...prices) : 0;
  const max = Math.max(min + 1, Math.ceil(maxRaw));
  const bucketCount = 40;
  const buckets = Array.from({ length: bucketCount }, () => 0);
  const span = max - min || 1;
  for (const price of prices) {
    const index = Math.min(bucketCount - 1, Math.max(0, Math.floor(((price - min) / span) * bucketCount)));
    buckets[index] += 1;
  }

  return {
    categories,
    materials: uniqueSorted(items.map((p) => p.attributes.material)),
    sizes: uniqueSorted(items.map((p) => p.attributes.size)),
    origins: uniqueSorted(items.map((p) => p.origin)),
    colors: uniqueSorted(items.map((p) => p.attributes.color)),
    periods: uniqueSorted(items.map((p) => p.attributes.period)),
    ages: uniqueSorted(items.map((p) => p.attributes.age)),
    price: { min, max, buckets }
  };
}

export function mergeFacetOptions(
  primary: ProductFilterOptions,
  fallback: ProductFilterOptions
): ProductFilterOptions {
  const merge = (a: string[], b: string[]) => uniqueSorted([...a, ...b]);

  return {
    categories: primary.categories.length ? primary.categories : fallback.categories,
    materials: merge(primary.materials, fallback.materials),
    sizes: merge(primary.sizes, fallback.sizes),
    origins: merge(primary.origins, fallback.origins),
    colors: merge(primary.colors, fallback.colors),
    periods: merge(primary.periods, fallback.periods),
    ages: merge(primary.ages, fallback.ages),
    price: primary.price?.buckets?.length ? primary.price : fallback.price
  };
}
