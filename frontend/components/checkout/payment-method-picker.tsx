'use client';

import type { Dictionary } from '@/lib/i18n';
import type { PaymentConfig } from '@/lib/payments';
import { MastercardIcon, VisaIcon } from '@/components/icons/payment-icons';
import { cn } from '@/lib/cn';

export type PaymentMethodKey = 'CARD' | 'BANK_TRANSFER' | 'PAYPAL';

type MethodOption = {
  key: PaymentMethodKey;
  available: boolean;
};

function availableMethods(config: PaymentConfig): MethodOption[] {
  const options: MethodOption[] = [
    { key: 'CARD', available: config.card },
    { key: 'BANK_TRANSFER', available: config.bankTransfer !== false },
    { key: 'PAYPAL', available: Boolean(config.paypal) }
  ];
  return options.filter((method) => method.available);
}

export function PaymentMethodPicker({
  dict,
  config,
  value = null,
  onChange,
  selectable = false
}: {
  dict: Dictionary['checkout'];
  config: PaymentConfig;
  value?: PaymentMethodKey | null;
  onChange?: (method: PaymentMethodKey) => void;
  selectable?: boolean;
}) {
  const methods = availableMethods(config);

  if (!methods.length) {
    return (
      <p className="text-sm text-amber-700">{dict.paymentMethods.card.unavailable}</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--oc-muted)]">
        {dict.paymentMethod}
      </p>
      <div className="space-y-3">
        {methods.map((method) => {
          const meta = dict.paymentMethods[method.key === 'CARD' ? 'card' : method.key === 'BANK_TRANSFER' ? 'bank' : 'paypal'];
          const selected = value === method.key;

          const content = (
            <>
              <p className="font-display text-lg uppercase tracking-[0.06em] text-[var(--oc-ink)]">{meta.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--oc-muted)]">{meta.description}</p>
              {method.key === 'CARD' ? (
                <div className="mt-3 flex items-center gap-2 text-[var(--oc-muted)]">
                  <VisaIcon className="h-4 w-auto" />
                  <MastercardIcon className="h-4 w-auto" />
                </div>
              ) : null}
            </>
          );

          if (!selectable) {
            return (
              <div
                key={method.key}
                className="border border-[var(--oc-ink)] bg-[var(--oc-bg-secondary)] p-4"
              >
                {content}
              </div>
            );
          }

          return (
            <button
              key={method.key}
              type="button"
              onClick={() => onChange?.(method.key)}
              className={cn(
                'w-full border p-4 text-left transition-colors',
                selected
                  ? 'border-[var(--oc-ink)] bg-[var(--oc-bg-secondary)] ring-1 ring-[var(--oc-ink)]'
                  : 'border-[var(--oc-line)] bg-transparent hover:border-[var(--oc-ink)]'
              )}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function paymentMethodLabel(
  dict: Dictionary['checkout'],
  method: PaymentMethodKey
): string {
  if (method === 'CARD') return dict.paymentMethods.card.title;
  if (method === 'BANK_TRANSFER') return dict.paymentMethods.bank.title;
  return dict.paymentMethods.paypal.title;
}
