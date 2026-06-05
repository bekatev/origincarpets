'use client';

import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useI18n } from '@/components/providers/i18n-provider';
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
  const { dict } = useI18n();
  const p = dict.payment;
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
      setError(p.cardNotReady);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card
      }
    });

    if (result.error) {
      setError(result.error.message ?? p.failed);
      setBusy(false);
      return;
    }

    try {
      await apiRequest('/payments/confirm', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentIntentId })
      });

      onPaid(p.success);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : p.confirmFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="oc-surface space-y-4 p-5">
      <h3 className="font-display text-xl uppercase tracking-[0.1em]">{p.title}</h3>
      <div className="rounded-2xl border border-[var(--oc-line)] bg-[var(--oc-paper)] p-4">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="button" onClick={submit} disabled={busy || !stripe} className="oc-btn-primary">
        {busy ? p.paying : p.payNow}
      </button>
      <p className="text-xs text-[var(--oc-muted)]">{p.testCard}</p>
    </div>
  );
}
