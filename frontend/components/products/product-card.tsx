import Link from 'next/link';
import Image from 'next/image';
import type { ProductItem } from '@/lib/products';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

export function ProductCard({ product }: { product: ProductItem }) {
  const cover = product.images[0] ?? 'https://placehold.co/800x600?text=Carpet';

  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <Image src={cover} alt={product.title} width={800} height={600} className="h-52 w-full object-cover" />
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-stone-500">{product.category.name}</p>
        <h3 className="text-lg font-semibold">{product.title}</h3>
        <p className="line-clamp-2 text-sm text-stone-600">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <p className="font-semibold">{product.price.toFixed(2)} GEL</p>
          <Link href={`/products/${product.slug}`} className="text-sm font-medium text-brand-700 hover:underline">
            View details
          </Link>
        </div>
        <AddToCartButton
          product={{
            id: product.id,
            slug: product.slug,
            title: product.title,
            price: product.price,
            image: cover
          }}
          className="w-full rounded-md bg-brand-700 px-4 py-2 text-white"
        />
      </div>
    </article>
  );
}
