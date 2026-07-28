'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ProductItem } from '@/lib/products';
import { ProductCardFoldMedia } from '@/components/products/product-card-fold-media';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductPrice } from '@/components/products/product-price';
import { SoldOutNotice } from '@/components/products/sold-out-notice';
import { useI18n } from '@/components/providers/i18n-provider';
import { localizeProduct, localizedPlainDescription } from '@/lib/product-localization';
import { ProductBadgeStack, saleDiscountPercent } from '@/lib/product-badges';
import { cn } from '@/lib/cn';

export type ProductCardVariant = 'grid' | 'list';

function metaBits(product: ProductItem) {
  return [
    product.attributes.size,
    product.attributes.material,
    product.origin,
    product.attributes.color,
    product.attributes.period,
    product.attributes.age
  ].filter((value): value is string => Boolean(value && String(value).trim()));
}

export function ProductCard({
  product,
  priority = false,
  variant = 'grid'
}: {
  product: ProductItem;
  priority?: boolean;
  variant?: ProductCardVariant;
}) {
  const { dict, locale } = useI18n();
  const localized = useMemo(() => localizeProduct(product, locale), [product, locale]);
  const plainDescription = useMemo(
    () => localizedPlainDescription(product, locale),
    [product, locale]
  );
  const cover = product.images[0];
  const meta = metaBits(localized);
  const sold = Boolean(product.isSold);
  const discount = saleDiscountPercent(product.price, product.compareAtPrice);

  if (variant === 'list') {
    return (
      <article className="group overflow-hidden rounded-sm border border-[var(--oc-line)] bg-[var(--oc-paper)] transition hover:border-[var(--oc-ink)]/25">
        <div className="flex flex-col sm:flex-row">
          <Link
            href={`/products/${product.slug}`}
            className="relative block w-full shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--oc-ink)] sm:w-[220px] md:w-[260px] lg:w-[280px]"
            aria-label={`View ${localized.title}`}
          >
            <ProductCardFoldMedia
              images={product.images}
              alt={localized.title}
              priority={priority}
              className="aspect-[4/3] sm:aspect-square sm:h-full"
            />
            <ProductBadgeStack
              isSold={sold}
              discountPercent={discount}
              soldLabel={dict.productDetail.sold}
            />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6 sm:p-5">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--oc-muted)]">
                {localized.category.name}
              </p>
              <h3 className="font-display text-xl leading-snug text-[var(--oc-ink)] md:text-2xl">
                <Link href={`/products/${product.slug}`} className="hover:opacity-60">
                  {localized.title}
                </Link>
              </h3>
              {meta.length ? (
                <p className="text-sm leading-relaxed text-[var(--oc-muted)]">{meta.join(' · ')}</p>
              ) : null}
              {plainDescription ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-[var(--oc-muted)]">
                  {plainDescription}
                </p>
              ) : null}
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex text-sm text-[var(--oc-ink)] underline-offset-4 hover:underline"
              >
                {dict.products.seeDetails}
              </Link>
            </div>

            <div className="flex shrink-0 flex-col items-start justify-between gap-3 border-t border-[var(--oc-line)] pt-4 sm:w-[180px] sm:items-end sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <p className="font-display text-xl text-[var(--oc-ink)]">
                <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
              </p>
              {sold ? (
                <SoldOutNotice className="sm:text-right" />
              ) : cover ? (
                <AddToCartButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    title: localized.title,
                    price: product.price,
                    image: cover
                  }}
                  className="oc-btn-primary w-full sm:w-auto"
                />
              ) : null}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn('group')}>
      <Link
        href={`/products/${product.slug}`}
        className="relative block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--oc-ink)]"
        aria-label={`View ${localized.title}`}
      >
        <ProductCardFoldMedia images={product.images} alt={localized.title} priority={priority} />
        <ProductBadgeStack
          isSold={sold}
          discountPercent={discount}
          soldLabel={dict.productDetail.sold}
        />
      </Link>
      <div className="mt-4 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--oc-muted)]">
          {localized.category.name}
        </p>
        <h3 className="font-display text-lg leading-snug text-[var(--oc-ink)]">
          <Link href={`/products/${product.slug}`} className="hover:opacity-60">
            {localized.title}
          </Link>
        </h3>
        <p className="text-sm text-[var(--oc-ink)]">
          <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
        </p>
        {sold ? (
          <SoldOutNotice />
        ) : cover ? (
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              title: localized.title,
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
