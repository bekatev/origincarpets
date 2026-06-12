'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import { useCart } from '@/lib/cart';
import { PURCHASE_ENABLED } from '@/lib/storefront';

export function AddToCartButton({
  product,
  className
}: {
  product: { id: string; slug: string; title: string; price: number; image?: string };
  className?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, ready } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { dict } = useI18n();
  const [added, setAdded] = useState(false);
  const inCart = isInCart(product.id);

  if (!PURCHASE_ENABLED) {
    return (
      <button type="button" className={className ?? 'oc-btn-primary'} disabled>
        {dict.storefront.purchaseComingSoon}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className ?? 'oc-btn-primary'}
      disabled={inCart}
      onClick={() => {
        if (ready && !isAuthenticated) {
          router.push('/login');
          return;
        }
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1000);
      }}
    >
      {inCart ? dict.cartActions.inCart : added ? dict.cartActions.added : dict.cartActions.add}
    </button>
  );
}
