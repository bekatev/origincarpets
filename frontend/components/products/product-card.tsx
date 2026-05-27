import Link from 'next/link';
import Image from 'next/image';
import type { ProductItem } from '@/lib/products';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

export function ProductCard({ product }: { product: ProductItem }) {
  const cover = product.images[0] ?? 'https://placehold.co/800x600?text=Carpet';

  return (
    <article className="group oc-surface overflow-hidden">
      <div className="overflow-hidden">
        <Image
          src={cover}
          alt={product.title}
          width={800}
          height={600}
          className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-3 p-5">
        <p className="oc-kicker">{product.category.name}</p>
        <h3 className="font-display text-xl uppercase leading-tight tracking-[0.08em]">{product.title}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-[var(--oc-muted)]">{product.description}</p>
        <div className="flex items-center justify-between border-t border-[var(--oc-line)] pt-3">
          <p className="text-sm font-semibold uppercase tracking-[0.08em]">{product.price.toFixed(2)} GEL</p>
          <Link href={`/products/${product.slug}`} className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--oc-brand)] hover:text-[var(--oc-brand-soft)]">
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
          className="oc-btn-primary w-full"
        />
      </div>
    </article>
  );
}
