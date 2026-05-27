import { API_ORIGIN, API_URL } from './api';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  sku: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
  attributes: {
    size: string | null;
    color: string | null;
    material: string | null;
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
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchProducts(filters: {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}): Promise<ProductListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.minPrice) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

  const result = await apiFetch<ProductListResponse>(`/products${params.toString() ? `?${params.toString()}` : ''}`);

  const normalized =
    result ?? {
      items: [],
      meta: { total: 0, page: 1, limit: 20, pages: 1 }
    };

  return {
    ...normalized,
    items: normalized.items.map((item) => ({
      ...item,
      images: item.images.map(toPublicImageUrl)
    }))
  };
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  return (await apiFetch<ProductCategory[]>('/products/categories')) ?? [];
}

export async function fetchProductBySlug(slug: string): Promise<ProductItem | null> {
  const product = await apiFetch<ProductItem>(`/products/${slug}`);
  if (!product) return null;
  return {
    ...product,
    images: product.images.map(toPublicImageUrl)
  };
}
