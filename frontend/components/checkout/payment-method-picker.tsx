'use client';

import type { Dictionary } from '@/lib/i18n';
import type { PaymentConfig } from '@/lib/payments';
import { MastercardIcon, VisaIcon } from '@/components/icons/payment-icons';

export function PaymentMethodPicker({
  dict,
  config
}: {
  dict: Dictionary['checkout'];
  config: PaymentConfig;
}) {
  const meta = dict.paymentMethods.card;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--oc-muted)]">
        {dict.paymentMethod}
      </p>
      <div className="border border-[var(--oc-ink)] bg-[var(--oc-bg-secondary)] p-4">
        <p className="font-display text-lg uppercase tracking-[0.06em] text-[var(--oc-ink)]">{meta.title}</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--oc-muted)]">{meta.description}</p>
        <div className="mt-3 flex items-center gap-2 text-[var(--oc-muted)]">
          <VisaIcon className="h-4 w-auto" />
          <MastercardIcon className="h-4 w-auto" />
        </div>
        {!config.card && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-amber-700">{meta.unavailable}</p>
        )}
      </div>
    </div>
  );
}
