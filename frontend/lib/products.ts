import { API_ORIGIN, API_URL } from './api';
import { buildFacetsFromProducts } from './product-facets';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFilterOptions {
  categories: ProductCategory[];
  materials: string[];
  sizes: string[];
  origins: string[];
  colors: string[];
  periods: string[];
  ages: string[];
}

export interface ProductListFilters {
  search?: string;
  category?: string;
  material?: string;
  size?: string;
  origin?: string;
  color?: string;
  period?: string;
  age?: string;
  georgian?: string;
  minPrice?: string;
  maxPrice?: string;
  limit?: string;
  page?: string;
}

export interface ProductLocalizations {
  title?: { en?: string | null; ka?: string | null; ge?: string | null };
  description?: { en?: string | null; ka?: string | null; ge?: string | null };
}

export interface ProductItem {
  id: string;
  slug: string;
  sku: string;
  title: string;
  description: string;
  localizations?: ProductLocalizations;
  price: number;
  origin?: string | null;
  images: string[];
  category: ProductCategory;
  attributes: {
    size: string | null;
    color: string | null;
    material: string | null;
    period?: string | null;
    age?: string | null;
  };
  shipping?: {
    weightKg: number | null;
    lengthCm: number | null;
    widthCm: number | null;
    heightCm: number | null;
  };
}

function toPublicImageUrl(url: unknown): string {
  if (typeof url !== 'string' || !url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      // Legacy uploads are served at the site root by nginx — use a path so the browser loads them directly.
      if (parsed.hostname === 'origincarpets.com' || parsed.hostname === 'www.origincarpets.com') {
        return parsed.pathname;
      }
    } catch {
      return url;
    }
    return url;
  }

  return url.startsWith('/') ? url : `/${url}`;
}

export interface ProductListResponse {
  items: ProductItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 300, tags: ['products'] }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

const FILTER_PARAM_KEYS: Array<keyof ProductListFilters> = [
  'search',
  'category',
  'material',
  'size',
  'origin',
  'color',
  'period',
  'age',
  'georgian',
  'minPrice',
  'maxPrice',
  'limit',
  'page'
];

export async function fetchProducts(filters: ProductListFilters): Promise<ProductListResponse> {
  const params = new URLSearchParams();

  for (const key of FILTER_PARAM_KEYS) {
    const value = filters[key];
    if (value) params.set(key, value);
  }

  if (!params.has('limit')) {
    params.set('limit', '100');
  }

  const result = await apiFetch<ProductListResponse>(`/products${params.toString() ? `?${params.toString()}` : ''}`);

  const normalized =
    result ?? {
      items: [],
      meta: { total: 0, page: 1, limit: 100, pages: 1 }
    };

  return {
    ...normalized,
    items: normalized.items.map((item) => ({
      ...item,
      images: item.images.map(toPublicImageUrl).filter(Boolean)
    }))
  };
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  return (
    (await apiFetch<ProductCategory[]>('/products/categories'))?.sort((a, b) => a.name.localeCompare(b.name)) ?? []
  );
}

export async function fetchProductFilters(): Promise<ProductFilterOptions> {
  const empty: ProductFilterOptions = {
    categories: [],
    materials: [],
    sizes: [],
    origins: [],
    colors: [],
    periods: [],
    ages: []
  };

  const [categories, fromApi] = await Promise.all([
    fetchCategories(),
    apiFetch<ProductFilterOptions>('/products/filters')
  ]);

  if (fromApi) {
    return {
      categories: fromApi.categories?.length ? fromApi.categories : categories,
      materials: fromApi.materials ?? [],
      sizes: fromApi.sizes ?? [],
      origins: fromApi.origins ?? [],
      colors: fromApi.colors ?? [],
      periods: fromApi.periods ?? [],
      ages: fromApi.ages ?? []
    };
  }

  const catalog = await fetchProducts({ limit: '500' });
  const fromProducts = buildFacetsFromProducts(categories, catalog.items);

  return fromProducts.categories.length || fromProducts.materials.length
    ? fromProducts
    : { ...empty, categories };
}

export async function fetchProductBySlug(slug: string): Promise<ProductItem | null> {
  const product = await apiFetch<ProductItem>(`/products/${slug}`);
  if (!product) return null;
  return {
    ...product,
    images: product.images.map(toPublicImageUrl).filter(Boolean)
  };
}
