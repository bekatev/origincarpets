'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RegisterOptionalSections } from '@/components/account/register-optional-sections';
import { type PaymentMethodKey } from '@/components/checkout/payment-method-picker';
import { emptyAddressValues, type ShippingAddressFieldValues } from '@/components/account/shipping-address-fields';
import { useAuth } from '@/components/providers/auth-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import { postJson, type AuthResponse } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated, ready } = useAuth();
  const { dict } = useI18n();
  const a = dict.auth;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [includeShipping, setIncludeShipping] = useState(false);
  const [includePayment, setIncludePayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey | null>(null);
  const [addressValues, setAddressValues] = useState<ShippingAddressFieldValues>(emptyAddressValues());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onAddressChange = useCallback((patch: Partial<ShippingAddressFieldValues>) => {
    setAddressValues((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace('/orders');
    }
  }, [ready, isAuthenticated, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email,
        password
      };

      if (includeShipping && addressValues.line1 && addressValues.deliveryCityId) {
        payload.shippingAddress = {
          deliveryCountryId: addressValues.deliveryCountryId,
          deliveryCityId: addressValues.deliveryCityId,
          fullName: addressValues.fullName || `${firstName} ${lastName}`.trim(),
          phone: addressValues.phone || undefined,
          region: addressValues.region || undefined,
          postalCode: addressValues.postalCode || undefined,
          line1: addressValues.line1,
          line2: addressValues.line2 || undefined
        };
      }

      if (includePayment && paymentMethod) {
        payload.preferredPaymentMethod = paymentMethod;
      }

      const data = await postJson<AuthResponse>('/auth/register', payload);
      login(data);
      router.push('/orders');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : a.registerFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="oc-section">
      <div className="oc-container max-w-lg">
        <h1 className="oc-heading text-3xl">{a.registerTitle}</h1>
        <p className="mt-2 text-sm text-[var(--oc-muted)]">{a.registerSubtitle}</p>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="oc-surface mt-6 space-y-4 p-6"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">{a.firstName}</label>
              <input
                type="text"
                className="oc-input"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">{a.lastName}</label>
              <input
                type="text"
                className="oc-input"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">{a.email}</label>
            <input
              type="email"
              className="oc-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">{a.password}</label>
            <input
              type="password"
              className="oc-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>

          <RegisterOptionalSections
            dict={a}
            checkoutDict={dict.checkout}
            includeShipping={includeShipping}
            includePayment={includePayment}
            onIncludeShippingChange={setIncludeShipping}
            onIncludePaymentChange={(value) => {
              setIncludePayment(value);
              if (value && !paymentMethod) {
                setPaymentMethod('CARD');
              }
              if (!value) {
                setPaymentMethod(null);
              }
            }}
            addressValues={addressValues}
            onAddressChange={onAddressChange}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button type="submit" className="oc-btn-primary w-full" disabled={loading}>
            {loading ? a.creating : a.registerButton}
          </button>
        </motion.form>

        <p className="mt-4 text-sm text-[var(--oc-muted)]">
          {a.alreadyRegistered}{' '}
          <Link href="/login" className="oc-link font-medium">
            {a.loginLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
