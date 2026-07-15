import type { Metadata } from 'next';
import { HomePageContent } from '@/components/home/home-page-content';
import { JsonLd } from '@/components/seo/json-ld';
import { getServerDictionary } from '@/lib/i18n-server';
import { fetchProducts } from '@/lib/products';
import {
  SITE_DESCRIPTION_EN,
  SITE_DESCRIPTION_KA,
  SITE_NAME,
  breadcrumbJsonLd,
  buildPageMetadata,
  itemListJsonLd
} from '@/lib/seo';
import { stockImages } from '@/lib/stock-images';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getServerDictionary();
  const title = dict.home.siteTitle;
  const description =
    locale === 'ka'
      ? SITE_DESCRIPTION_KA
      : dict.home.heroBody?.slice(0, 160) || SITE_DESCRIPTION_EN;

  return buildPageMetadata({
    title,
    description,
    path: '/',
    image: stockImages.og,
    imageAlt: `${SITE_NAME} — ${title}`
  });
}

export default async function HomePage() {
  const catalog = await fetchProducts({ limit: '5' });
  const { locale, dict } = await getServerDictionary();
  const description = locale === 'ka' ? SITE_DESCRIPTION_KA : SITE_DESCRIPTION_EN;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: 'Home', path: '/' }]),
          itemListJsonLd({
            name: dict.home.featuredCollection || 'Featured carpets',
            description,
            path: '/',
            items: catalog.items.map((item) => ({
              name: item.title,
              slug: item.slug,
              image: item.images[0]
            }))
          })
        ]}
      />
      <HomePageContent featured={catalog.items} />
    </>
  );
}
