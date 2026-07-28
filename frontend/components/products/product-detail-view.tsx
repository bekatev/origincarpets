'use client';

import { useMemo } from 'react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductPrice } from '@/components/products/product-price';
import { SoldOutNotice } from '@/components/products/sold-out-notice';
import { useI18n } from '@/components/providers/i18n-provider';
import { localizeProduct } from '@/lib/product-localization';
import type { ProductItem } from '@/lib/products';
import { saleDiscountPercent } from '@/lib/product-badges';
import { PURCHASE_ENABLED } from '@/lib/storefront';
import { toPlainText } from '@/lib/text';
import { formatDimensionsBothFromCm, formatWeightBothFromKg } from '@/lib/units';

export function ProductDetailView({ product }: { product: ProductItem }) {
  const { dict, locale } = useI18n();
  const d = dict.productDetail;
  const localized = useMemo(() => localizeProduct(product, locale), [product, locale]);
  const sold = Boolean(product.isSold);
  const discount = saleDiscountPercent(product.price, product.compareAtPrice);

  const dimensionsLabel =
    product.shipping?.lengthCm != null && product.shipping?.widthCm != null
      ? formatDimensionsBothFromCm(
          product.shipping.lengthCm,
          product.shipping.widthCm,
          d.dimensionUnit
        )
      : d.na;

  const weightLabel =
    product.shipping?.weightKg != null
      ? formatWeightBothFromKg(product.shipping.weightKg)
      : d.na;

  return (
    <section className="space-y-8">
      <p className="oc-eyebrow">{localized.category.name}</p>
      <h1 className="oc-heading-sm">{localized.title}</h1>
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="text-lg text-[var(--oc-ink)]">
          <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
        </p>
        {!sold && discount != null ? (
          <span className="bg-[var(--oc-sale)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
            −{discount}%
          </span>
        ) : null}
        {sold ? (
          <span className="bg-[var(--oc-sold)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white ring-1 ring-white/30">
            {d.sold}
          </span>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-6 border-t border-[var(--oc-line)] pt-8 text-sm">
        <div>
          <dt className="text-[var(--oc-muted)]">{d.origin}</dt>
          <dd className="mt-1 font-medium">{localized.origin?.trim() || d.na}</dd>
        </div>
        <div>
          <dt className="text-[var(--oc-muted)]">{d.age}</dt>
          <dd className="mt-1 font-medium">{localized.attributes.age ?? d.na}</dd>
        </div>
        <div>
          <dt className="text-[var(--oc-muted)]">{d.size}</dt>
          <dd className="mt-1 font-medium">{localized.attributes.size ?? d.na}</dd>
        </div>
        <div>
          <dt className="text-[var(--oc-muted)]">{d.dimensions}</dt>
          <dd className="mt-1 font-medium">{dimensionsLabel}</dd>
        </div>
        <div>
          <dt className="text-[var(--oc-muted)]">{d.weight}</dt>
          <dd className="mt-1 font-medium">{weightLabel}</dd>
        </div>
        <div>
          <dt className="text-[var(--oc-muted)]">{d.color}</dt>
          <dd className="mt-1 font-medium">{localized.attributes.color ?? d.na}</dd>
        </div>
        <div>
          <dt className="text-[var(--oc-muted)]">{d.material}</dt>
          <dd className="mt-1 font-medium">{localized.attributes.material ?? d.na}</dd>
        </div>
        <div>
          <dt className="text-[var(--oc-muted)]">{d.sku}</dt>
          <dd className="mt-1 font-medium">{product.sku}</dd>
        </div>
      </dl>

      <p className="whitespace-pre-line text-[15px] leading-8 text-[var(--oc-muted)]">
        {toPlainText(localized.description)}
      </p>

      {!PURCHASE_ENABLED ? (
        <p className="text-sm text-[var(--oc-muted)]">{dict.storefront.deliveryComingSoonBody}</p>
      ) : null}

      {sold ? (
        <SoldOutNotice />
      ) : (
        <AddToCartButton
          product={{
            id: product.id,
            slug: product.slug,
            title: localized.title,
            price: product.price,
            image: product.images[0]
          }}
          className="oc-btn-primary"
        />
      )}
    </section>
  );
}
