import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailLayout } from '@/components/products/product-detail-layout';
import { JsonLd } from '@/components/seo/json-ld';
import { getServerDictionary } from '@/lib/i18n-server';
import { localizeProduct } from '@/lib/product-localization';
import { fetchProductBySlug } from '@/lib/products';
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  productJsonLd
} from '@/lib/seo';
import { toPlainText } from '@/lib/text';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  const { locale, dict } = await getServerDictionary();

  if (!product) {
    return {
      title: dict.productDetail.notFound,
      robots: { index: false, follow: false }
    };
  }

  const localized = localizeProduct(product, locale);
  const description = toPlainText(localized.description).slice(0, 160)
    || `${localized.title} — handmade carpet from Origin Carpets. Worldwide delivery.`;
  const originBit = product.origin ? ` from ${product.origin}` : '';
  const materialBit = localized.attributes.material ? `, ${localized.attributes.material}` : '';
  const title = `${localized.title}${originBit}`.slice(0, 60);

  return {
    ...buildPageMetadata({
      title,
      description: `${description}${materialBit}`.slice(0, 160),
      path: `/products/${product.slug}`,
      image: product.images[0],
      imageAlt: localized.title
    }),
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'USD'
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const { locale, dict } = await getServerDictionary();
  const localized = localizeProduct(product, locale);
  const description = toPlainText(localized.description).slice(0, 500) || localized.title;

  return (
    <section className="oc-section">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: dict.products.title || 'Carpets', path: '/products' },
            { name: localized.title, path: `/products/${product.slug}` }
          ]),
          productJsonLd({
            name: localized.title,
            description,
            slug: product.slug,
            sku: product.sku,
            price: product.price,
            images: product.images,
            categoryName: product.category.name,
            material: localized.attributes.material,
            color: localized.attributes.color
          })
        ]}
      />
      <ProductDetailLayout product={product} />
    </section>
  );
}
