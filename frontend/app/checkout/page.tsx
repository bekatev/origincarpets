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
      <main className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <p className="mt-3 text-stone-700">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block text-brand-700 hover:underline">
          Go to products
        </Link>
      </main>
    );
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return (
    <main className="mx-auto grid max-w-6xl gap-8 p-8 lg:grid-cols-[1.5fr_1fr]">
      <section className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        {!createdOrder ? (
          <form onSubmit={onCreateOrder} className="mt-2 space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Shipping type</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShippingType('GEORGIA')}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    shippingType === 'GEORGIA' ? 'border-brand-700 bg-brand-700 text-white' : 'border-stone-300'
                  }`}
                >
                  Georgia (Free)
                </button>
                <button
                  type="button"
                  onClick={() => setShippingType('INTERNATIONAL')}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    shippingType === 'INTERNATIONAL' ? 'border-brand-700 bg-brand-700 text-white' : 'border-stone-300'
                  }`}
                >
                  International
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Country code (GE/US/DE...)" value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} required />
              <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Region" value={region} onChange={(e) => setRegion(e.target.value)} />
              <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>

            <input className="w-full rounded-md border border-stone-300 px-3 py-2" placeholder="Address line 1" value={line1} onChange={(e) => setLine1(e.target.value)} required />
            <input className="w-full rounded-md border border-stone-300 px-3 py-2" placeholder="Address line 2 (optional)" value={line2} onChange={(e) => setLine2(e.target.value)} />

            <button disabled={busy} type="submit" className="rounded-md bg-brand-700 px-4 py-2 text-white disabled:opacity-60">
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
          <p className="text-sm text-red-600">Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
      </section>

      <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Order Summary</h2>
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

        <div className="mt-4 border-t border-stone-200 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} GEL</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Shipping {quote ? `(${quote.shippingZone.name})` : ''}</span>
            <span>{loadingQuote ? '...' : `${shippingEstimate.toFixed(2)} GEL`}</span>
          </div>
          {quote && (
            <p className="mt-1 text-xs text-stone-500">
              Provider: {quote.provider} • ETA {quote.deliveryDays.min ?? '?'}-{quote.deliveryDays.max ?? '?'} days
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{total.toFixed(2)} GEL</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
