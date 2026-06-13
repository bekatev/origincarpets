'use client';

import { useEffect, useState } from 'react';
import { PaymentMethodPicker } from '@/components/checkout/payment-method-picker';
import { useI18n } from '@/components/providers/i18n-provider';
import { fetchAccountProfile, updateAccountProfile } from '@/lib/account';
import { readStoredToken } from '@/lib/auth';
import { fetchPaymentConfig, type PaymentConfig } from '@/lib/payments';

export function PaymentSettings() {
  const { dict } = useI18n();
  const s = dict.settings;
  const checkoutDict = dict.checkout;
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ card: false });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = readStoredToken();
    if (!token) return;

    void Promise.all([fetchPaymentConfig(), fetchAccountProfile(token)])
      .then(([config]) => {
        setPaymentConfig(config);
        if (config.card) {
          return updateAccountProfile(token, { preferredPaymentMethod: 'CARD' });
        }
        return null;
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="oc-surface space-y-4 p-5">
      <div>
        <h2 className="font-display text-xl uppercase tracking-[0.08em]">{s.paymentTitle}</h2>
        <p className="mt-1 text-sm text-[var(--oc-muted)]">{s.paymentSubtitle}</p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--oc-muted)]">{s.loading}</p>
      ) : (
        <>
          <PaymentMethodPicker dict={checkoutDict} config={paymentConfig} />
          <p className="text-xs leading-relaxed text-[var(--oc-muted)]">{s.paymentSecureNote}</p>
          {success ? <p className="text-sm text-green-700">{success}</p> : null}
        </>
      )}
    </section>
  );
}
