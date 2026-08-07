import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';
import { absoluteUrl, getSiteUrl } from '@/lib/seo';

type ProductForSitemap = {
  slug: string;
  updatedAt?: string;
};

type ProductListResponse = {
  items: ProductForSitemap[];
  meta?: { pages?: number; total?: number };
};

async function fetchAllProductSlugs(): Promise<ProductForSitemap[]> {
  const items: ProductForSitemap[] = [];
  let page = 1;
  let pages = 1;

  while (page <= pages && page <= 20) {
    const response = await fetch(`${API_URL}/products?limit=100&page=${page}`, {
      next: { revalidate: 600, tags: ['products'] }
    });
    if (!response.ok) break;

    const payload = (await response.json()) as ProductListResponse;
    items.push(...(payload.items ?? []));
    pages = payload.meta?.pages ?? 1;
    page += 1;
  }

  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: absoluteUrl('/products'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95
    },
    {
      url: absoluteUrl('/policies/privacy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3
    },
    {
      url: absoluteUrl('/policies/return-refund'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3
    },
    {
      url: absoluteUrl('/policies/shipping'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3
    }
  ];

  try {
    const products = await fetchAllProductSlugs();
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.85
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
