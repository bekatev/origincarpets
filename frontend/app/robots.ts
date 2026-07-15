import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products', '/products/', '/policies/'],
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/checkout',
          '/checkout/',
          '/cart',
          '/cart/',
          '/account',
          '/account/',
          '/orders',
          '/orders/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/api/',
          '/revalidate-shop'
        ]
      },
      {
        userAgent: 'GPTBot',
        allow: ['/products', '/products/'],
        disallow: ['/dashboard', '/checkout', '/account', '/api/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
