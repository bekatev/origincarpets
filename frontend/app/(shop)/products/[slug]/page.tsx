import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { fetchProductBySlug } from '@/lib/products';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found'
    };
  }

  return {
    title: product.title,
    description: product.description.slice(0, 150),
    alternates: {
      canonical: `/products/${product.slug}`
    },
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 150),
      type: 'website',
      url: `http://localhost:3000/products/${product.slug}`,
      images: product.images.length ? [{ url: product.images[0], alt: product.title }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description.slice(0, 150),
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
    <main className="oc-section">
      <div className="oc-container grid gap-8 md:grid-cols-2">
        <section className="oc-surface p-4">
        <Image
          src={product.images[0] ?? 'https://placehold.co/1200x900?text=Carpet'}
          alt={product.title}
          width={1200}
          height={900}
          priority
          className="h-[500px] w-full object-cover"
        />
        </section>

        <section className="space-y-5">
          <p className="oc-kicker">{product.category.name}</p>
          <h1 className="font-display text-4xl uppercase leading-tight tracking-[0.1em]">{product.title}</h1>
          <p className="text-sm font-semibold uppercase tracking-[0.12em]">{product.price.toFixed(2)} GEL</p>

          <dl className="oc-surface grid grid-cols-2 gap-3 p-4 text-sm">
            <div>
              <dt className="text-[var(--oc-muted)]">Size</dt>
              <dd className="mt-1 font-medium">{product.attributes.size ?? 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-[var(--oc-muted)]">Color</dt>
              <dd className="mt-1 font-medium">{product.attributes.color ?? 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-[var(--oc-muted)]">Material</dt>
              <dd className="mt-1 font-medium">{product.attributes.material ?? 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-[var(--oc-muted)]">SKU</dt>
              <dd className="mt-1 font-medium">{product.sku}</dd>
            </div>
          </dl>

          <p className="leading-7 text-[var(--oc-muted)]">{product.description}</p>

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
    </main>
  );
}
