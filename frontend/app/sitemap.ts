import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';

type ProductForSitemap = {
  slug: string;
  updatedAt?: string;
};

type ProductListResponse = {
  items: ProductForSitemap[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, priority: 1, changeFrequency: 'daily' },
    { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/cart`, priority: 0.5, changeFrequency: 'daily' },
    { url: `${baseUrl}/checkout`, priority: 0.5, changeFrequency: 'daily' },
    { url: `${baseUrl}/login`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${baseUrl}/register`, priority: 0.4, changeFrequency: 'monthly' }
  ];

  try {
    const response = await fetch(`${API_URL}/products?limit=500`, {
      cache: 'force-cache',
      next: { revalidate: 600 }
    });

    if (!response.ok) {
      return staticRoutes;
    }

    const payload = (await response.json()) as ProductListResponse;

    const productRoutes: MetadataRoute.Sitemap = (payload.items ?? []).map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      priority: 0.8,
      changeFrequency: 'weekly'
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
