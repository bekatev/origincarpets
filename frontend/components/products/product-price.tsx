'use client';

import { FormattedPrice } from '@/components/products/formatted-price';
import { cn } from '@/lib/cn';

export function ProductPrice({
  price,
  compareAtPrice,
  className,
  compareClassName
}: {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  compareClassName?: string;
}) {
  const onSale = compareAtPrice != null && compareAtPrice > price;

  if (!onSale) {
    return <FormattedPrice amount={price} className={className} />;
  }

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <FormattedPrice amount={price} className="font-semibold text-[var(--oc-sale)]" />
      <span className={cn('text-[0.85em] text-[var(--oc-muted)] line-through', compareClassName)}>
        <FormattedPrice amount={compareAtPrice} />
      </span>
    </span>
  );
}
