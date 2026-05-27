'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { API_URL, apiRequest } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form';

type ShippingType = 'GEORGIA' | 'INTERNATIONAL';

type ShippingQuote = {
  shippingType: ShippingType;
  shippingZone: { id: string; code: string; name: string };
  shippingCost: number;
  provider: string;
  deliveryDays: { min: number | null; max: number | null };
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
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
    }
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
      setError('Please login before checkout.');
      return;
    }

    if (!items.length) {
      setError('Cart is empty.');
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
      setSuccess(`Order ${order.orderNumber} created. Please complete payment.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Checkout failed');
    } finally {
      setBusy(false);
    }
  }

  if (!items.length && !createdOrder) {
    return (
      <main className="oc-section">
        <div className="oc-container max-w-4xl">
          <h1 className="oc-heading">Checkout</h1>
          <p className="mt-3 text-sm text-[var(--oc-muted)]">Your cart is empty.</p>
          <Link href="/products" className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-[var(--oc-brand)] hover:text-[var(--oc-brand-soft)]">
            Go to products
          </Link>
        </div>
      </main>
    );
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return (
    <main className="oc-section">
      <div className="oc-container grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section className="oc-surface space-y-4 p-5">
          <h1 className="font-display text-3xl uppercase tracking-[0.1em]">Checkout</h1>

        {!createdOrder ? (
          <form onSubmit={onCreateOrder} className="mt-2 space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em]">Shipping type</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShippingType('GEORGIA')}
                  className={`oc-btn px-3 py-2 ${
                    shippingType === 'GEORGIA' ? 'border-[var(--oc-brand)] bg-[var(--oc-brand)] text-white' : 'border-[var(--oc-line)] bg-white'
                  }`}
                >
                  Georgia (Free)
                </button>
                <button
                  type="button"
                  onClick={() => setShippingType('INTERNATIONAL')}
                  className={`oc-btn px-3 py-2 ${
                    shippingType === 'INTERNATIONAL' ? 'border-[var(--oc-brand)] bg-[var(--oc-brand)] text-white' : 'border-[var(--oc-line)] bg-white'
                  }`}
                >
                  International
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input className="oc-input" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <input className="oc-input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="oc-input" placeholder="Country code (GE/US/DE...)" value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} required />
              <input className="oc-input" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <input className="oc-input" placeholder="Region" value={region} onChange={(e) => setRegion(e.target.value)} />
              <input className="oc-input" placeholder="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>

            <input className="oc-input" placeholder="Address line 1" value={line1} onChange={(e) => setLine1(e.target.value)} required />
            <input className="oc-input" placeholder="Address line 2 (optional)" value={line2} onChange={(e) => setLine2(e.target.value)} />

            <button disabled={busy} type="submit" className="oc-btn-primary">
              {busy ? 'Creating order...' : 'Create order'}
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
                setSuccess(`${message} Order ${createdOrder.orderNumber}.`);
                clearCart();
              }}
            />
          </Elements>
        ) : (
          <p className="text-sm text-red-700">Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</p>
        )}

          {error && <p className="text-sm text-red-700">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}
        </section>

        <aside className="oc-surface h-fit p-5">
          <h2 className="font-display text-2xl uppercase tracking-[0.1em]">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span>{(item.price * item.quantity).toFixed(2)} GEL</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-[var(--oc-line)] pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} GEL</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Shipping {quote ? `(${quote.shippingZone.name})` : ''}</span>
            <span>{loadingQuote ? '...' : `${shippingEstimate.toFixed(2)} GEL`}</span>
          </div>
          {quote && (
            <p className="mt-1 text-xs text-[var(--oc-muted)]">
              Provider: {quote.provider} • ETA {quote.deliveryDays.min ?? '?'}-{quote.deliveryDays.max ?? '?'} days
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{total.toFixed(2)} GEL</span>
          </div>
        </div>
        </aside>
      </div>
    </main>
  );
}
