import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: ['/dashboard', '/checkout', '/api/']
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
