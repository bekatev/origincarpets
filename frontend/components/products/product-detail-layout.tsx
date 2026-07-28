'use client';

import { useMemo } from 'react';
import { ProductDetailView } from '@/components/products/product-detail-view';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { useI18n } from '@/components/providers/i18n-provider';
import { localizeProduct } from '@/lib/product-localization';
import type { ProductItem } from '@/lib/products';
import { ProductBadgeStack, saleDiscountPercent } from '@/lib/product-badges';

export function ProductDetailLayout({ product }: { product: ProductItem }) {
  const { dict, locale } = useI18n();
  const localized = useMemo(() => localizeProduct(product, locale), [product, locale]);
  const sold = Boolean(product.isSold);
  const discount = saleDiscountPercent(product.price, product.compareAtPrice);

  return (
    <div className="oc-container grid gap-12 md:grid-cols-2">
      <ProductImageGallery
        images={localized.images}
        title={localized.title}
        badge={
          <ProductBadgeStack
            isSold={sold}
            discountPercent={discount}
            soldLabel={dict.productDetail.sold}
          />
        }
      />
      <ProductDetailView product={product} />
    </div>
  );
}
