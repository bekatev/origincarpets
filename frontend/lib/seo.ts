import type { Metadata } from 'next';
import { stockImages } from '@/lib/stock-images';

/** Canonical public site origin — never localhost in production metadata. */
export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.FRONTEND_URL ||
    'https://origincarpets.com';
  return raw.replace(/\/$/, '');
}

export const SITE_NAME = 'Origin Carpets';
export const SITE_TAGLINE = 'Finest Caucasian and Oriental Carpets';
export const SITE_DESCRIPTION_EN =
  'Shop authentic Caucasian and Oriental handmade carpets and kilims from Origin Carpets in Tbilisi. Antique and tribal rugs with worldwide UPS delivery.';
export const SITE_DESCRIPTION_KA =
  'შეიძინეთ ავთენტური კავკასიური და აღმოსავლური ხელნაკეთი ხალიჩები და ქილიმები Origin Carpets-ისგან თბილისში. ანტიკური და ტრიბალური ხალიჩები UPS-ით მსოფლიოში.';

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  const base = getSiteUrl();
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Absolute URL for product/media images (legacy root files + /api/media). */
export function absoluteImageUrl(url: string) {
  if (!url) return absoluteUrl(stockImages.og);
  if (/^https?:\/\//i.test(url)) return url;
  return absoluteUrl(url.startsWith('/') ? url : `/${url}`);
}

export function stripQuery(path: string) {
  return path.split('?')[0] || '/';
}

/** Cookie-based EN/KA — expose crawlable ?lang= alternates for hreflang. */
export function languageAlternates(path: string): NonNullable<Metadata['alternates']> {
  const clean = stripQuery(path) || '/';
  return {
    canonical: clean,
    languages: {
      en: `${clean}?lang=en`,
      ka: `${clean}?lang=ka`,
      'x-default': clean
    }
  };
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
}): Metadata {
  const url = absoluteUrl(stripQuery(input.path));
  const image = absoluteImageUrl(input.image || stockImages.og);
  const imageAlt = input.imageAlt || input.title;

  return {
    title: input.title,
    description: input.description,
    alternates: languageAlternates(input.path),
    robots: input.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      type: input.type || 'website',
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      alternateLocale: ['ka_GE'],
      images: [{ url: image, width: 1200, height: 800, alt: imageAlt }]
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image]
    }
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    legalName: SITE_NAME,
    url: getSiteUrl(),
    logo: absoluteUrl('/brand/logo-icon.png'),
    description: SITE_DESCRIPTION_EN,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tbilisi',
      addressCountry: 'GE'
    },
    areaServed: 'Worldwide',
    sameAs: [
      'https://www.facebook.com/origincarpets',
      'https://www.instagram.com/origincarpets'
    ]
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_DESCRIPTION_EN,
    inLanguage: ['en', 'ka'],
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: absoluteUrl('/brand/logo-icon.png')
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${getSiteUrl()}/products?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  slug: string;
  sku: string;
  price: number;
  images: string[];
  categoryName?: string | null;
  material?: string | null;
  color?: string | null;
}) {
  const url = absoluteUrl(`/products/${input.slug}`);
  const images = (input.images.length ? input.images : [stockImages.og]).map(absoluteImageUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    sku: input.sku,
    mpn: input.sku,
    url,
    image: images,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME
    },
    category: input.categoryName || 'Handmade carpets',
    material: input.material || undefined,
    color: input.color || undefined,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: input.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          name: 'Worldwide'
        }
      }
    }
  };
}

export function itemListJsonLd(input: {
  name: string;
  description: string;
  path: string;
  items: Array<{ name: string; slug: string; image?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/products/${item.slug}`),
        name: item.name,
        image: item.image ? absoluteImageUrl(item.image) : undefined
      }))
    }
  };
}
