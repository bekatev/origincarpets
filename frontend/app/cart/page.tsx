'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RequireAuth } from '@/components/auth/require-auth';
import { useCurrency } from '@/components/providers/currency-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import { useCart } from '@/lib/cart';

export default function CartPage() {
  const { items, subtotal, removeFromCart, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { dict } = useI18n();
  const c = dict.cart;

  return (
    <RequireAuth>
    <main className="oc-section">
      <div className="oc-container space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="oc-heading">{c.title}</h1>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:underline"
            >
              {c.clear}
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <div className="oc-surface p-7">
            <p className="text-sm text-[var(--oc-muted)]">{c.empty}</p>
            <Link href="/products" className="oc-link mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.14em]">
              {c.browse}
            </Link>
          </div>
        ) : (
          <>
            <section className="space-y-3">
              {items.map((item) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="oc-surface flex items-center gap-4 p-4"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={240}
                      height={180}
                      className="h-20 w-28 border border-[var(--oc-line)] object-cover"
                    />
                  ) : (
                    <div className="h-20 w-28 border border-[var(--oc-line)] bg-[var(--oc-bg-secondary)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg uppercase tracking-[0.08em]">{item.title}</p>
                    <p className="text-sm text-[var(--oc-muted)]">{formatPrice(item.price)}</p>
                  </div>

                  <p className="w-28 text-right text-sm font-semibold">{formatPrice(item.price)}</p>
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:underline"
                    onClick={() => removeFromCart(item.id)}
                  >
                    {c.remove}
                  </button>
                </motion.article>
              ))}
            </section>

            <section className="oc-surface p-5">
              <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.12em]">
                <span>{c.subtotal}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--oc-muted)]">{c.shippingNote}</p>
              <Link href="/checkout" className="oc-btn-primary mt-4 inline-flex">
                {c.checkout}
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
    </RequireAuth>
  );
}
