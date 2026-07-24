'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { postJson } from '@/lib/api';
import { useCurrency } from '@/components/providers/currency-provider';
import { useI18n } from '@/components/providers/i18n-provider';

type LookupResult = {
  orderNumber: string;
  status: string;
  currency: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  deliveryMethod: string | null;
  createdAt: string;
  parcelTrackingNumber: string | null;
  items: Array<{ title: string; quantity: number; unitPrice: number; lineTotal: number }>;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2: string | null;
    city: string;
    region: string | null;
    postalCode: string | null;
    country: string;
    phone: string | null;
  };
};

function OrderLookupForm() {
  const searchParams = useSearchParams();
  const { dict } = useI18n();
  const { formatPrice } = useCurrency();
  const t = dict.orderLookup;
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  useEffect(() => {
    const presetEmail = searchParams.get('email')?.trim() ?? '';
    const presetOrder = searchParams.get('order')?.trim() ?? '';
    if (presetEmail) setEmail(presetEmail);
    if (presetOrder) setOrderNumber(presetOrder);
  }, [searchParams]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setBusy(true);

    try {
      const data = await postJson<LookupResult>('/orders/lookup', {
        email: email.trim(),
        orderNumber: orderNumber.trim()
      });
      setResult(data);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : t.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="oc-section">
      <div className="oc-container max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="oc-heading">{t.title}</h1>
          <p className="text-sm text-[var(--oc-muted)]">{t.subtitle}</p>
        </header>

        <form onSubmit={onSubmit} className="oc-surface space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--oc-muted)]">
              {t.email}
            </span>
            <input
              className="oc-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--oc-muted)]">
              {t.orderNumber}
            </span>
            <input
              className="oc-input"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ORD-…"
              required
            />
          </label>
          <button type="submit" className="oc-btn-primary" disabled={busy}>
            {busy ? t.searching : t.submit}
          </button>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </form>

        {result ? (
          <section className="oc-surface space-y-4 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl uppercase tracking-[0.1em]">{result.orderNumber}</h2>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--oc-brand)]">
                {t.status}: {result.status}
              </p>
            </div>
            <p className="text-sm text-[var(--oc-muted)]">
              {t.placedOn}: {new Date(result.createdAt).toLocaleString()}
            </p>
            {result.parcelTrackingNumber ? (
              <p className="text-sm">
                {t.tracking}: <span className="font-medium">{result.parcelTrackingNumber}</span>
              </p>
            ) : null}

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--oc-muted)]">
                {t.items}
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {result.items.map((item) => (
                  <li key={`${item.title}-${item.quantity}`} className="flex justify-between gap-4">
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[var(--oc-line)] pt-3 text-sm">
              <div className="flex justify-between">
                <span>{dict.checkout.subtotal}</span>
                <span>{formatPrice(result.subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>{dict.checkout.shipping}</span>
                <span>{formatPrice(result.shippingCost)}</span>
              </div>
              <div className="mt-2 flex justify-between text-base font-semibold">
                <span>{t.total}</span>
                <span>{formatPrice(result.total)}</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--oc-muted)]">
                {t.shipping}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--oc-ink)]">
                {result.shippingAddress.fullName}
                <br />
                {result.shippingAddress.line1}
                {result.shippingAddress.line2 ? (
                  <>
                    <br />
                    {result.shippingAddress.line2}
                  </>
                ) : null}
                <br />
                {[result.shippingAddress.city, result.shippingAddress.region]
                  .filter(Boolean)
                  .join(', ')}
                {result.shippingAddress.postalCode ? ` ${result.shippingAddress.postalCode}` : ''}
                <br />
                {result.shippingAddress.country}
                {result.shippingAddress.phone ? (
                  <>
                    <br />
                    {result.shippingAddress.phone}
                  </>
                ) : null}
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense fallback={null}>
      <OrderLookupForm />
    </Suspense>
  );
}
