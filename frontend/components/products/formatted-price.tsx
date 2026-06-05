'use client';

import { useCurrency } from '@/components/providers/currency-provider';

export function FormattedPrice({
  amount,
  className
}: {
  amount: number;
  className?: string;
}) {
  const { formatPrice } = useCurrency();
  return <span className={className}>{formatPrice(amount)}</span>;
}
