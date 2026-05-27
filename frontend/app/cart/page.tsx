'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Shopping Cart</h1>
        {items.length > 0 && (
          <button type="button" onClick={clearCart} className="text-sm text-red-600 hover:underline">
            Clear cart
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white p-6">
          <p className="text-stone-700">Your cart is empty.</p>
          <Link href="/products" className="mt-3 inline-block text-brand-700 hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-4">
                <img
                  src={item.image ?? 'https://placehold.co/240x180?text=Carpet'}
                  alt={item.title}
                  className="h-20 w-28 rounded border border-stone-200 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.title}</p>
                  <p className="text-sm text-stone-600">{item.price.toFixed(2)} GEL each</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded border border-stone-300 px-2"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    className="rounded border border-stone-300 px-2"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <p className="w-28 text-right font-medium">{(item.price * item.quantity).toFixed(2)} GEL</p>
                <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </article>
            ))}
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} GEL</span>
            </div>
            <p className="mt-2 text-sm text-stone-600">Shipping and taxes are calculated at checkout.</p>
            <button type="button" className="mt-4 rounded-md bg-brand-700 px-4 py-2 text-white">
              Proceed to checkout (next step)
            </button>
          </section>
        </>
      )}
    </main>
  );
}
