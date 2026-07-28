import { cn } from '@/lib/cn';

export function saleDiscountPercent(price: number, compareAtPrice?: number | null): number | null {
  if (compareAtPrice == null || !(compareAtPrice > price) || price < 0) return null;
  return Math.max(1, Math.round((1 - price / compareAtPrice) * 100));
}

/** Compact inline badge for list layouts (avoids absolute overlap on mobile). */
export function ProductStatusChip({
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
          'inline-flex shrink-0 bg-[var(--oc-sold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white',
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
          'inline-flex shrink-0 bg-[var(--oc-sale)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white',
          className
        )}
      >
        −{discountPercent}%
      </span>
    );
  }

  return null;
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
          'pointer-events-none absolute right-3 top-3 z-20 bg-[var(--oc-sold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_6px_16px_-6px_rgba(29,78,216,0.85)] ring-1 ring-white/40',
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
          'pointer-events-none absolute left-3 top-3 z-20 bg-[var(--oc-sale)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm',
          className
        )}
      >
        −{discountPercent}%
      </span>
    );
  }

  return null;
}
