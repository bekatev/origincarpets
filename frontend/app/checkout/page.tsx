'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { RequireAuth } from '@/components/auth/require-auth';
import { API_URL, apiRequest } from '@/lib/api';
import { useCurrency } from '@/components/providers/currency-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import { useCart } from '@/lib/cart';
import { ShippingMethodPicker } from '@/components/checkout/shipping-method-picker';
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form';
import { cn } from '@/lib/cn';

type ShippingType = 'GEORGIA' | 'INTERNATIONAL';

type ShippingQuote = {
  shippingType: ShippingType;
  providerKey: string;
  shippingZone: { id: string; code: string; name: string };
  shippingCost: number;
  provider: string;
  deliveryDays: { min: number | null; max: number | null };
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { dict } = useI18n();
  const t = dict.checkout;
  const [shippingType, setShippingType] = useState<ShippingType>('GEORGIA');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('GE');
  const [city, setCity] = useState('Tbilisi');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{ orderId: string; orderNumber: string } | null>(null);
  const [intent, setIntent] = useState<{ paymentIntentId: string; clientSecret: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (shippingType === 'GEORGIA') {
      setCountryCode('GE');
      return;
    }
    setCountryCode((current) => (current === 'GE' ? 'US' : current));
  }, [shippingType]);

  useEffect(() => {
    let cancelled = false;

    async function loadShippingQuote() {
      setLoadingQuote(true);
      try {
        const params = new URLSearchParams({
          type: shippingType,
          countryCode: countryCode || (shippingType === 'GEORGIA' ? 'GE' : 'US')
        });
        const response = await fetch(`${API_URL}/shipping/cost?${params.toString()}`);
        const payload = (await response.json()) as ShippingQuote;

        if (!cancelled) {
          setQuote(response.ok ? payload : null);
        }
      } catch {
        if (!cancelled) {
          setQuote(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingQuote(false);
        }
      }
    }

    void loadShippingQuote();
    return () => {
      cancelled = true;
    };
  }, [shippingType, countryCode]);

  const shippingEstimate = quote?.shippingCost ?? 0;
  const total = useMemo(() => subtotal + shippingEstimate, [subtotal, shippingEstimate]);

  async function onCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError(t.loginRequired);
      return;
    }

    if (!items.length) {
      setError(t.cartEmpty);
      return;
    }

    setBusy(true);

    try {
      const order = await apiRequest<{ id: string; orderNumber: string; status: string }>('/orders', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          shippingType,
          shippingAddress: {
            fullName,
            phone: phone || undefined,
            countryCode,
            city,
            region: region || undefined,
            postalCode: postalCode || undefined,
            line1,
            line2: line2 || undefined
          }
        })
      });

      const intentRes = await apiRequest<{ paymentIntentId: string; clientSecret: string }>('/payments/intent', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      });

      setCreatedOrder({ orderId: order.id, orderNumber: order.orderNumber });
      setIntent(intentRes);
      setSuccess(t.orderCreated.replace('{orderNumber}', order.orderNumber));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.failed);
    } finally {
      setBusy(false);
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return (
    <RequireAuth>
    {!items.length && !createdOrder ? (
      <main className="oc-section">
        <div className="oc-container max-w-4xl">
          <h1 className="oc-heading">{t.title}</h1>
          <p className="mt-3 text-sm text-[var(--oc-muted)]">{t.empty}</p>
          <Link href="/products" className="oc-link mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.14em]">
            {t.browseProducts}
          </Link>
        </div>
      </main>
    ) : (
    <main className="oc-section">
      <div className="oc-container grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="oc-surface space-y-4 p-5"
        >
          <h1 className="font-display text-3xl uppercase tracking-[0.1em]">{t.title}</h1>

        {!createdOrder ? (
          <form onSubmit={onCreateOrder} className="mt-2 space-y-4">
            <ShippingMethodPicker
              dict={t}
              shippingType={shippingType}
              quote={quote}
              loadingQuote={loadingQuote}
              formatPrice={formatPrice}
              onSelect={setShippingType}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <input className="oc-input" placeholder={t.fullName} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <input className="oc-input" placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input
                className={cn('oc-input', shippingType === 'GEORGIA' && 'opacity-60')}
                placeholder={t.countryCode}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                readOnly={shippingType === 'GEORGIA'}
                required
              />
              <input className="oc-input" placeholder={t.city} value={city} onChange={(e) => setCity(e.target.value)} required />
              <input className="oc-input" placeholder={t.region} value={region} onChange={(e) => setRegion(e.target.value)} />
              <input className="oc-input" placeholder={t.postalCode} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>

            <input className="oc-input" placeholder={t.address1} value={line1} onChange={(e) => setLine1(e.target.value)} required />
            <input className="oc-input" placeholder={t.address2} value={line2} onChange={(e) => setLine2(e.target.value)} />

            <button disabled={busy} type="submit" className="oc-btn-primary">
              {busy ? t.creating : t.createOrder}
            </button>
          </form>
        ) : intent?.clientSecret && createdOrder && token ? (
          <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret }}>
            <StripePaymentForm
              token={token}
              orderId={createdOrder.orderId}
              paymentIntentId={intent.paymentIntentId}
              clientSecret={intent.clientSecret}
              onPaid={(message) => {
                setSuccess(
                  t.paymentSuccess.replace('{message}', message).replace('{orderNumber}', createdOrder.orderNumber)
                );
                clearCart();
              }}
            />
          </Elements>
        ) : (
          <p className="text-sm text-red-700">{t.stripeMissing}</p>
        )}

          {error && <p className="text-sm text-red-700">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="oc-surface h-fit p-5"
        >
          <h2 className="font-display text-2xl uppercase tracking-[0.1em]">{t.summary}</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-[var(--oc-line)] pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span>{t.subtotal}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>
              {t.shipping} {quote ? `(${quote.shippingZone.name})` : ''}
            </span>
            <span>{loadingQuote ? '...' : formatPrice(shippingEstimate)}</span>
          </div>
          {quote && (
            <p className="mt-2 text-xs leading-relaxed text-[var(--oc-muted)]">
              {t.shippingProvider}:{' '}
              {quote.providerKey === 'georgian_post' ? t.methods.georgianPost.title : t.methods.dhlExpress.title}
              <br />
              {t.shippingEta}:{' '}
              {t.shippingDays
                .replace('{min}', String(quote.deliveryDays.min ?? '?'))
                .replace('{max}', String(quote.deliveryDays.max ?? '?'))}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-base font-semibold">
            <span>{t.total}</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        </motion.aside>
      </div>
    </main>
    )}
    </RequireAuth>
  );
}
