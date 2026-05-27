'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { useI18n } from '@/components/providers/i18n-provider';

export function CartLink() {
  const { totalItems } = useCart();
  const { dict } = useI18n();

  return (
    <Link href="/cart" className="oc-btn-secondary px-3 py-2">
      {dict.common.cart} ({totalItems})
    </Link>
  );
}
