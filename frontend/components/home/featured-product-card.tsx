'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ProductCardFoldMedia } from '@/components/products/product-card-fold-media';
import { FormattedPrice } from '@/components/products/formatted-price';
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
        <div className="mt-4 space-y-1.5 text-center">
          <h3 className="font-display text-lg leading-snug text-[var(--oc-ink)] transition group-hover:opacity-60">
            {localized.title}
          </h3>
          <p className="text-sm text-[var(--oc-muted)]">
            <FormattedPrice amount={product.price} />
          </p>
        </div>
      </Link>
    </article>
  );
}
