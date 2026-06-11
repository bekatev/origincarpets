'use client';

import Link from 'next/link';
import { ProductCardFoldMedia } from '@/components/products/product-card-fold-media';
import { FormattedPrice } from '@/components/products/formatted-price';
import type { ProductItem } from '@/lib/products';

export function FeaturedProductCard({ product, priority = false }: { product: ProductItem; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <ProductCardFoldMedia images={product.images} alt={product.title} priority={priority} />
        <div className="mt-4 space-y-1.5 text-center">
          <h3 className="font-display text-lg leading-snug text-[var(--oc-ink)] transition group-hover:opacity-60">
            {product.title}
          </h3>
          <p className="text-sm text-[var(--oc-muted)]">
            <FormattedPrice amount={product.price} />
          </p>
        </div>
      </Link>
    </article>
  );
}
