'use client';

import { useMemo } from 'react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { FormattedPrice } from '@/components/products/formatted-price';
import { useCurrency } from '@/components/providers/currency-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import { localizeProduct } from '@/lib/product-localization';
import type { ProductItem } from '@/lib/products';
import { PURCHASE_ENABLED } from '@/lib/storefront';
import { toPlainText } from '@/lib/text';
import {
  formatDimensionsFromCm,
  formatWeightFromKg,
  measurementSystemForCurrency
} from '@/lib/units';

export function ProductDetailView({ product }: { product: ProductItem }) {
  const { dict, locale } = useI18n();
  const { currency } = useCurrency();
  const d = dict.productDetail;
  const localized = useMemo(() => localizeProduct(product, locale), [product, locale]);
  const system = measurementSystemForCurrency(currency);

  const dimensionsLabel =
    product.shipping?.lengthCm != null && product.shipping?.widthCm != null
      ? formatDimensionsFromCm(
          product.shipping.lengthCm,
          product.shipping.widthCm,
          system,
          d.dimensionUnit
        )
      : d.na;

  const weightLabel =
    product.shipping?.weightKg != null
      ? formatWeightFromKg(product.shipping.weightKg, system)
      : d.na;

  return (
    <section className="space-y-8">
      <p className="oc-eyebrow">{localized.category.name}</p>
      <h1 className="oc-heading-sm">{localized.title}</h1>
      <p className="text-lg text-[var(--oc-ink)]">
        <FormattedPrice amount={product.price} />
      </p>

      <dl className="grid grid-cols-2 gap-6 border-t border-[var(--oc-line)] pt-8 text-sm">
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
    </section>
  );
}
