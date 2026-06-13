'use client';

import { useEffect, useState } from 'react';
import {
  PaymentMethodPicker,
  paymentMethodLabel,
  type PaymentMethodKey
} from '@/components/checkout/payment-method-picker';
import { useI18n } from '@/components/providers/i18n-provider';
import { fetchAccountProfile, updateAccountProfile } from '@/lib/account';
import { readStoredToken } from '@/lib/auth';
import { fetchPaymentConfig, type PaymentConfig } from '@/lib/payments';

export function PaymentSettings() {
  const { dict } = useI18n();
  const s = dict.settings;
  const checkoutDict = dict.checkout;
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ card: false, bankTransfer: true });
  const [savedMethod, setSavedMethod] = useState<PaymentMethodKey | null>(null);
  const [draftMethod, setDraftMethod] = useState<PaymentMethodKey | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = readStoredToken();
    if (!token) return;

    void Promise.all([fetchPaymentConfig(), fetchAccountProfile(token)])
      .then(([config, profile]) => {
        setPaymentConfig(config);
        const method = profile.preferredPaymentMethod as PaymentMethodKey | null;
        setSavedMethod(method);
        setDraftMethod(method);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : s.loadFailed))
      .finally(() => setLoading(false));
  }, [s.loadFailed]);

  function startAdd() {
    setEditing(true);
    setDraftMethod(null);
    setError(null);
    setSuccess(null);
  }

  function startEdit() {
    setEditing(true);
    setDraftMethod(savedMethod);
    setError(null);
    setSuccess(null);
  }

  async function onSave() {
    if (!draftMethod) {
      setError(s.selectPaymentMethod);
      return;
    }

    const token = readStoredToken();
    if (!token) return;

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const profile = await updateAccountProfile(token, { preferredPaymentMethod: draftMethod });
      const method = profile.preferredPaymentMethod as PaymentMethodKey | null;
      setSavedMethod(method);
      setDraftMethod(method);
      setEditing(false);
      setSuccess(s.paymentSaved);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : s.paymentSaveFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    const token = readStoredToken();
    if (!token) return;

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await updateAccountProfile(token, { preferredPaymentMethod: null });
      setSavedMethod(null);
      setDraftMethod(null);
      setEditing(false);
      setSuccess(s.paymentRemoved);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : s.paymentSaveFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="oc-surface space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl uppercase tracking-[0.08em]">{s.paymentTitle}</h2>
          <p className="mt-1 text-sm text-[var(--oc-muted)]">{s.paymentSubtitle}</p>
        </div>
        {!editing && !savedMethod ? (
          <button type="button" className="oc-btn-secondary text-xs" onClick={startAdd}>
            {s.addPaymentMethod}
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--oc-muted)]">{s.loading}</p>
      ) : editing ? (
        <div className="space-y-4 border-t border-[var(--oc-line)] pt-4">
          <PaymentMethodPicker
            dict={checkoutDict}
            config={paymentConfig}
            value={draftMethod}
            onChange={setDraftMethod}
            selectable
          />
          <p className="text-xs leading-relaxed text-[var(--oc-muted)]">{s.paymentSecureNote}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="oc-btn-primary" onClick={() => void onSave()} disabled={busy}>
              {busy ? s.saving : savedMethod ? s.updatePaymentMethod : s.savePaymentMethod}
            </button>
            <button
              type="button"
              className="oc-btn-secondary"
              onClick={() => {
                setEditing(false);
                setDraftMethod(savedMethod);
              }}
              disabled={busy}
            >
              {s.cancel}
            </button>
          </div>
        </div>
      ) : savedMethod ? (
        <div className="border border-[var(--oc-line)] p-4">
          <p className="font-medium">{paymentMethodLabel(checkoutDict, savedMethod)}</p>
          <p className="mt-1 text-sm text-[var(--oc-muted)]">
            {checkoutDict.paymentMethods[savedMethod === 'CARD' ? 'card' : savedMethod === 'BANK_TRANSFER' ? 'bank' : 'paypal'].description}
          </p>
          <div className="mt-3 flex gap-3">
            <button type="button" className="oc-link text-xs font-semibold uppercase tracking-[0.12em]" onClick={startEdit}>
              {s.editPaymentMethod}
            </button>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700"
              onClick={() => void onRemove()}
              disabled={busy}
            >
              {s.removePaymentMethod}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--oc-muted)]">{s.noPaymentMethod}</p>
      )}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}
    </section>
  );
}
