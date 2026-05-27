'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

export function AddToCartButton({
  product,
  className
}: {
  product: { id: string; slug: string; title: string; price: number; image?: string };
  className?: string;
}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={className ?? 'oc-btn-primary'}
      onClick={() => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1000);
      }}
    >
      {added ? 'Added' : 'Add to cart'}
    </button>
  );
}
