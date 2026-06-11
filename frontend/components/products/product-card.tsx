'use client';

import Link from 'next/link';
import type { ProductItem } from '@/lib/products';
import { ProductCardFoldMedia } from '@/components/products/product-card-fold-media';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { FormattedPrice } from '@/components/products/formatted-price';

export function ProductCard({ product, priority = false }: { product: ProductItem; priority?: boolean }) {
  const cover = product.images[0];

  return (
    <article className="group">
      <Link
        href={`/products/${product.slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--oc-ink)]"
        aria-label={`View ${product.title}`}
      >
        <ProductCardFoldMedia images={product.images} alt={product.title} priority={priority} />
      </Link>
      <div className="mt-4 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--oc-muted)]">{product.category.name}</p>
        <h3 className="font-display text-lg leading-snug text-[var(--oc-ink)]">
          <Link href={`/products/${product.slug}`} className="hover:opacity-60">
            {product.title}
          </Link>
        </h3>
        <p className="text-sm text-[var(--oc-ink)]">
          <FormattedPrice amount={product.price} />
        </p>
        {cover ? (
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              title: product.title,
              price: product.price,
              image: cover
            }}
            className="oc-btn-primary mt-3 w-full sm:w-auto"
          />
        ) : null}
      </div>
    </article>
  );
}
