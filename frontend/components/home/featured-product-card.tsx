'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ProductCardFoldMedia } from '@/components/products/product-card-fold-media';
import { ProductPrice } from '@/components/products/product-price';
import { useI18n } from '@/components/providers/i18n-provider';
import { localizeProduct } from '@/lib/product-localization';
import type { ProductItem } from '@/lib/products';

export function FeaturedProductCard({ product, priority = false }: { product: ProductItem; priority?: boolean }) {
  const { locale } = useI18n();
  const localized = useMemo(() => localizeProduct(product, locale), [product, locale]);

  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <ProductCardFoldMedia images={product.images} alt={localized.title} priority={priority} />
        <div className="mt-4 bg-[var(--oc-paper)] px-3 py-3.5 sm:px-4">
          <h3 className="font-display text-[1.05rem] leading-snug text-[var(--oc-ink)] transition group-hover:opacity-55">
            {localized.title}
          </h3>
          <p className="mt-1 text-[13px] tracking-wide text-[var(--oc-muted)]">
            <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
          </p>
        </div>
      </Link>
    </article>
  );
}
