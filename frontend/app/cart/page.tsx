'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  return (
    <main className="oc-section">
      <div className="oc-container space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="oc-heading">Shopping Cart</h1>
        {items.length > 0 && (
          <button type="button" onClick={clearCart} className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:underline">
            Clear cart
          </button>
        )}
        </header>

        {items.length === 0 ? (
          <div className="oc-surface p-7">
            <p className="text-sm text-[var(--oc-muted)]">Your cart is empty.</p>
            <Link href="/products" className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-[var(--oc-brand)] hover:text-[var(--oc-brand-soft)]">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <section className="space-y-3">
              {items.map((item) => (
                <article key={item.id} className="oc-surface flex items-center gap-4 p-4">
                  <Image
                    src={item.image ?? 'https://placehold.co/240x180?text=Carpet'}
                    alt={item.title}
                    width={240}
                    height={180}
                    className="h-20 w-28 border border-[var(--oc-line)] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg uppercase tracking-[0.08em]">{item.title}</p>
                    <p className="text-sm text-[var(--oc-muted)]">{item.price.toFixed(2)} GEL each</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" className="oc-btn-secondary px-3 py-1" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      -
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button type="button" className="oc-btn-secondary px-3 py-1" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>

                  <p className="w-28 text-right text-sm font-semibold">{(item.price * item.quantity).toFixed(2)} GEL</p>
                  <button type="button" className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:underline" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </article>
              ))}
            </section>

            <section className="oc-surface p-5">
              <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.12em]">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} GEL</span>
              </div>
              <p className="mt-2 text-sm text-[var(--oc-muted)]">Shipping and taxes are calculated at checkout.</p>
              <Link href="/checkout" className="oc-btn-primary mt-4">
                Proceed to checkout
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
