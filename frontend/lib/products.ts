import { API_ORIGIN, API_URL } from './api';
import { buildFacetsFromProducts, mergeFacetOptions } from './product-facets';

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

export interface ProductItem {
  id: string;
  slug: string;
  sku: string;
  title: string;
  description: string;
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
}

function toPublicImageUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
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
    const isDev = process.env.NODE_ENV === 'development';
    const response = await fetch(`${API_URL}${path}`, {
      cache: isDev ? 'no-store' : 'force-cache',
      ...(isDev ? {} : { next: { revalidate: 300, tags: ['products'] } })
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

  const [categories, fromApi, catalog] = await Promise.all([
    fetchCategories(),
    apiFetch<ProductFilterOptions>('/products/filters'),
    fetchProducts({ limit: '500' })
  ]);

  const fromProducts = buildFacetsFromProducts(categories, catalog.items);

  if (!fromApi) {
    return fromProducts.categories.length || fromProducts.materials.length
      ? fromProducts
      : { ...empty, categories };
  }

  const normalized: ProductFilterOptions = {
    categories: fromApi.categories?.length ? fromApi.categories : categories,
    materials: fromApi.materials ?? [],
    sizes: fromApi.sizes ?? [],
    origins: fromApi.origins ?? [],
    colors: fromApi.colors ?? [],
    periods: fromApi.periods ?? [],
    ages: fromApi.ages ?? []
  };

  return mergeFacetOptions(normalized, fromProducts);
}

export async function fetchProductBySlug(slug: string): Promise<ProductItem | null> {
  const product = await apiFetch<ProductItem>(`/products/${slug}`);
  if (!product) return null;
  return {
    ...product,
    images: product.images.map(toPublicImageUrl).filter(Boolean)
  };
}
