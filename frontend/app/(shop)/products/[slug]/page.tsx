import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { fetchProductBySlug } from '@/lib/products';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found'
    };
  }

  return {
    title: `${product.title} | Carpet Commerce`,
    description: product.description.slice(0, 150),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 150),
      images: product.images.length ? [{ url: product.images[0] }] : undefined
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
    <main className="mx-auto grid max-w-6xl gap-8 p-8 md:grid-cols-2">
      <section>
        <img
          src={product.images[0] ?? 'https://placehold.co/1200x900?text=Carpet'}
          alt={product.title}
          className="h-[420px] w-full rounded-lg border border-stone-200 object-cover"
        />
      </section>

      <section className="space-y-4">
        <p className="text-sm uppercase tracking-wide text-stone-500">{product.category.name}</p>
        <h1 className="text-3xl font-semibold">{product.title}</h1>
        <p className="text-lg font-semibold">{product.price.toFixed(2)} GEL</p>

        <dl className="grid grid-cols-2 gap-3 rounded-lg border border-stone-200 bg-white p-4 text-sm">
          <div>
            <dt className="text-stone-500">Size</dt>
            <dd className="font-medium">{product.attributes.size ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Color</dt>
            <dd className="font-medium">{product.attributes.color ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Material</dt>
            <dd className="font-medium">{product.attributes.material ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-stone-500">SKU</dt>
            <dd className="font-medium">{product.sku}</dd>
          </div>
        </dl>

        <p className="leading-7 text-stone-700">{product.description}</p>

        <AddToCartButton
          product={{
            id: product.id,
            slug: product.slug,
            title: product.title,
            price: product.price,
            image: product.images[0]
          }}
          className="rounded-md bg-brand-700 px-4 py-2 text-white"
        />
      </section>
    </main>
  );
}
