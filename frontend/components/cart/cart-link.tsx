'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { useCart } from '@/lib/cart';
import { useI18n } from '@/components/providers/i18n-provider';

export function CartLink() {
  const { isAuthenticated, ready } = useAuth();
  const { totalItems } = useCart();
  const { dict } = useI18n();

  if (!ready || !isAuthenticated) {
    return null;
  }

  return (
    <Link href="/cart" className="oc-nav-link">
      {dict.common.cart} ({totalItems})
    </Link>
  );
}
