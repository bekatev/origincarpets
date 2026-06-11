import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailLayout } from '@/components/products/product-detail-layout';
import { getServerDictionary } from '@/lib/i18n-server';
import { fetchProductBySlug } from '@/lib/products';
import { toPlainText } from '@/lib/text';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    const { dict } = await getServerDictionary();
    return {
      title: dict.productDetail.notFound
    };
  }

  return {
    title: product.title,
    description: toPlainText(product.description).slice(0, 150),
    alternates: {
      canonical: `/products/${product.slug}`
    },
    openGraph: {
      title: product.title,
      description: toPlainText(product.description).slice(0, 150),
      type: 'website',
      url: `http://localhost:3000/products/${product.slug}`,
      images: product.images.length
        ? product.images.map((url) => ({ url, alt: product.title }))
        : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: toPlainText(product.description).slice(0, 150),
      images: product.images.length ? [product.images[0]] : undefined
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="oc-section">
      <ProductDetailLayout product={product} />
    </section>
  );
}
