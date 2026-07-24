'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { useI18n } from '@/components/providers/i18n-provider';
import { PURCHASE_ENABLED } from '@/lib/storefront';

export function CartLink() {
  const { totalItems } = useCart();
  const { dict } = useI18n();

  if (!PURCHASE_ENABLED) {
    return null;
  }

  return (
    <Link href="/cart" className="oc-nav-link">
      {dict.common.cart} ({totalItems})
    </Link>
  );
}
