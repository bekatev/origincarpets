'use client';

import { useMemo } from 'react';
import { ProductDetailView } from '@/components/products/product-detail-view';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { useI18n } from '@/components/providers/i18n-provider';
import { localizeProduct } from '@/lib/product-localization';
import type { ProductItem } from '@/lib/products';

export function ProductDetailLayout({ product }: { product: ProductItem }) {
  const { locale } = useI18n();
  const localized = useMemo(() => localizeProduct(product, locale), [product, locale]);

  return (
    <div className="oc-container grid gap-12 md:grid-cols-2">
      <ProductImageGallery images={localized.images} title={localized.title} />
      <ProductDetailView product={product} />
    </div>
  );
}
