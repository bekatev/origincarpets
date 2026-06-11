import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { FormattedPrice } from '@/components/products/formatted-price';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
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
  const [{ dict }, product] = await Promise.all([getServerDictionary(), fetchProductBySlug(slug)]);
  const d = dict.productDetail;

  if (!product) {
    notFound();
  }

  return (
    <section className="oc-section">
      <div className="oc-container grid gap-12 md:grid-cols-2">
        <ProductImageGallery images={product.images} title={product.title} />

        <section className="space-y-8">
          <p className="oc-eyebrow">{product.category.name}</p>
          <h1 className="oc-heading-sm">{product.title}</h1>
          <p className="text-lg text-[var(--oc-ink)]">
            <FormattedPrice amount={product.price} />
          </p>

          <dl className="grid grid-cols-2 gap-6 border-t border-[var(--oc-line)] pt-8 text-sm">
            <div>
              <dt className="text-[var(--oc-muted)]">{d.size}</dt>
              <dd className="mt-1 font-medium">{product.attributes.size ?? d.na}</dd>
            </div>
            <div>
              <dt className="text-[var(--oc-muted)]">{d.dimensions}</dt>
              <dd className="mt-1 font-medium">
                {product.shipping?.lengthCm && product.shipping?.widthCm
                  ? `${product.shipping.lengthCm} × ${product.shipping.widthCm} ${d.dimensionUnit}`
                  : d.na}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--oc-muted)]">{d.weight}</dt>
              <dd className="mt-1 font-medium">
                {product.shipping?.weightKg != null
                  ? `${product.shipping.weightKg} ${d.weightUnit}`
                  : d.na}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--oc-muted)]">{d.color}</dt>
              <dd className="mt-1 font-medium">{product.attributes.color ?? d.na}</dd>
            </div>
            <div>
              <dt className="text-[var(--oc-muted)]">{d.material}</dt>
              <dd className="mt-1 font-medium">{product.attributes.material ?? d.na}</dd>
            </div>
            <div>
              <dt className="text-[var(--oc-muted)]">{d.sku}</dt>
              <dd className="mt-1 font-medium">{product.sku}</dd>
            </div>
          </dl>

          <p className="whitespace-pre-line text-[15px] leading-8 text-[var(--oc-muted)]">
            {toPlainText(product.description)}
          </p>

          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              title: product.title,
              price: product.price,
              image: product.images[0]
            }}
            className="oc-btn-primary"
          />
        </section>
      </div>
    </section>
  );
}
