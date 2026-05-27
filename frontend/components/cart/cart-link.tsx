'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';

export function CartLink() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">
      Cart ({totalItems})
    </Link>
  );
}
