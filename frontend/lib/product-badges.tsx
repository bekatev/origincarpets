import { cn } from '@/lib/cn';

export function saleDiscountPercent(price: number, compareAtPrice?: number | null): number | null {
  if (compareAtPrice == null || !(compareAtPrice > price) || price < 0) return null;
  return Math.max(1, Math.round((1 - price / compareAtPrice) * 100));
}

export function ProductBadgeStack({
  isSold,
  discountPercent,
  soldLabel,
  className
}: {
  isSold?: boolean;
  discountPercent?: number | null;
  soldLabel: string;
  className?: string;
}) {
  if (isSold) {
    return (
      <span
        className={cn(
          'pointer-events-none absolute left-2 top-2 z-10 bg-[var(--oc-ink)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--oc-paper)] shadow-sm',
          className
        )}
      >
        {soldLabel}
      </span>
    );
  }

  if (discountPercent != null && discountPercent > 0) {
    return (
      <span
        className={cn(
          'pointer-events-none absolute left-2 top-2 z-10 bg-[var(--oc-sale)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm',
          className
        )}
      >
        −{discountPercent}%
      </span>
    );
  }

  return null;
}
