'use client';

import { cn } from '@/lib/cn';
import type { Dictionary } from '@/lib/i18n';

type ShippingType = 'GEORGIA' | 'INTERNATIONAL';

type ShippingQuote = {
  shippingType: ShippingType;
  providerKey: string;
  provider: string;
  shippingCost: number;
  deliveryDays: { min: number | null; max: number | null };
};

export function ShippingMethodPicker({
  dict,
  shippingType,
  quote,
  loadingQuote,
  formatPrice,
  onSelect
}: {
  dict: Dictionary['checkout'];
  shippingType: ShippingType;
  quote: ShippingQuote | null;
  loadingQuote: boolean;
  formatPrice: (amountUsd: number) => string;
  onSelect: (type: ShippingType) => void;
}) {
  const methods: Array<{
    type: ShippingType;
    content: (typeof dict.methods)['georgianPost'] | (typeof dict.methods)['dhlExpress'];
    showWhy?: boolean;
  }> = [
    { type: 'GEORGIA', content: dict.methods.georgianPost },
    { type: 'INTERNATIONAL', content: dict.methods.dhlExpress, showWhy: true }
  ];

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--oc-muted)]">
        {dict.shippingType}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {methods.map((method) => {
          const selected = shippingType === method.type;
          const price =
            selected && quote && quote.shippingType === method.type
              ? quote.shippingCost === 0
                ? dict.shippingFree
                : formatPrice(quote.shippingCost)
              : method.type === 'GEORGIA'
                ? dict.shippingFree
                : loadingQuote && selected
                  ? '…'
                  : null;

          return (
            <button
              key={method.type}
              type="button"
              onClick={() => onSelect(method.type)}
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
                    {method.content.badge}
                  </span>
                  <p className="mt-1 font-display text-lg uppercase tracking-[0.06em] text-[var(--oc-ink)]">
                    {method.content.title}
                  </p>
                </div>
                {price && (
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--oc-ink)]">
                    {price}
                  </span>
                )}
              </div>

              {'why' in method.content && method.showWhy && (
                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--oc-brand)]">
                  {method.content.why}
                </p>
              )}

              <p className="oc-body mt-3 text-[13px] leading-relaxed">{method.content.description}</p>

              <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[var(--oc-muted)]">
                {dict.shippingEta}: {method.content.eta}
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
    </div>
  );
}
