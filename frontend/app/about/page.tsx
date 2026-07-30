import type { Metadata } from 'next';
import { AboutPageContent } from '@/components/about/about-page-content';
import { JsonLd } from '@/components/seo/json-ld';
import { getServerDictionary } from '@/lib/i18n-server';
import { breadcrumbJsonLd, buildPageMetadata, SITE_NAME } from '@/lib/seo';
import { stockImages } from '@/lib/stock-images';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getServerDictionary();
  const title = dict.aboutPage.metaTitle;
  const description = dict.aboutPage.metaDescription;

  return buildPageMetadata({
    title,
    description,
    path: '/about',
    image: stockImages.og,
    imageAlt: `${SITE_NAME} — ${title}`
  });
}

export default async function AboutPage() {
  const { dict } = await getServerDictionary();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: dict.nav.about, path: '/about' }
        ])}
      />
      <AboutPageContent />
    </>
  );
}
