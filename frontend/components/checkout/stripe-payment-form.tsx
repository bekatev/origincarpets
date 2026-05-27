'use client';

import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { apiRequest } from '@/lib/api';

export function StripePaymentForm({
  token,
  orderId,
  paymentIntentId,
  clientSecret,
  onPaid
}: {
  token: string;
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
  onPaid: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!stripe || !elements) {
      return;
    }

    setBusy(true);
    setError(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      setBusy(false);
      setError('Card input is not ready');
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card
      }
    });

    if (result.error) {
      setError(result.error.message ?? 'Payment failed');
      setBusy(false);
      return;
    }

    try {
      await apiRequest('/payments/confirm', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentIntentId })
      });

      onPaid('Payment successful. Order marked as PAID.');
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : 'Failed to confirm payment on server');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="font-semibold">Pay with card (Stripe test mode)</h3>
      <div className="rounded-md border border-stone-300 p-3">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="button" onClick={submit} disabled={busy || !stripe} className="rounded-md bg-brand-700 px-4 py-2 text-white disabled:opacity-60">
        {busy ? 'Processing payment...' : 'Confirm payment'}
      </button>
      <p className="text-xs text-stone-500">Use Stripe test card: 4242 4242 4242 4242</p>
    </div>
  );
}
