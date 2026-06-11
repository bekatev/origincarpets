'use client';

import { cn } from '@/lib/cn';
import type { Dictionary } from '@/lib/i18n';
import type { DeliveryMethod, DeliveryMethodKey, ShippingQuote } from '@/lib/shipping';

export function ShippingMethodPicker({
  dict,
  methods,
  selectedMethod,
  quote,
  loadingQuote,
  formatPrice,
  onSelect
}: {
  dict: Dictionary['checkout'];
  methods: DeliveryMethod[];
  selectedMethod: DeliveryMethodKey | '';
  quote: ShippingQuote | null;
  loadingQuote: boolean;
  formatPrice: (amountUsd: number) => string;
  onSelect: (method: DeliveryMethodKey) => void;
}) {
  if (!methods.length) {
    return (
      <p className="text-sm text-[var(--oc-muted)]">{dict.methodsLoading}</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--oc-muted)]">
        {dict.shippingType}
      </p>
      <div className="grid gap-3">
        {methods.map((method) => {
          const selected = selectedMethod === method.value;
          const methodQuoted = selected && quote && quote.deliveryMethod === method.value;
          const methodFree =
            methodQuoted && (Boolean(quote.freeShipping) || Number(quote.shippingCost) === 0);
          const price =
            methodQuoted
              ? methodFree
                ? dict.shippingFree
                : formatPrice(Number(quote.shippingCost))
              : loadingQuote && selected
                ? '…'
                : null;

          const label = method.label.en;

          return (
            <button
              key={method.value}
              type="button"
              onClick={() => onSelect(method.value)}
              className={cn(
                'group relative border p-4 text-left transition duration-300',
                selected
                  ? 'border-[var(--oc-ink)] bg-[var(--oc-bg-secondary)]'
                  : 'border-[var(--oc-line)] bg-[var(--oc-paper)] hover:border-[var(--oc-muted)]'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--oc-muted)]">
                    {dict.methods.georgianPost.badge}
                  </span>
                  <p className="mt-1 font-display text-lg uppercase tracking-[0.06em] text-[var(--oc-ink)]">
                    {label}
                  </p>
                  {method.recommended && (
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--oc-brand)]">
                      {dict.methods.recommended}
                    </p>
                  )}
                </div>
                {price && (
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--oc-ink)]">
                    {price}
                  </span>
                )}
              </div>

              <p className="oc-body mt-3 text-[13px] leading-relaxed">{method.descTop.en}</p>
              <p className="mt-2 text-xs text-[var(--oc-muted)]">{method.descBottom.en}</p>

              <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[var(--oc-muted)]">
                {dict.shippingEta}: {method.minDeliveryDays}–{method.maxDeliveryDays} {dict.businessDays}
              </p>

              <span
                className={cn(
                  'absolute right-3 top-3 h-2 w-2 rounded-full border border-[var(--oc-line)] transition',
                  selected && 'border-[var(--oc-ink)] bg-[var(--oc-ink)]'
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      {quote?.isEstimate && !quote.freeShipping && selectedMethod && (
        <p className="text-xs text-amber-700">{dict.shippingEstimateWarning}</p>
      )}
    </div>
  );
}
