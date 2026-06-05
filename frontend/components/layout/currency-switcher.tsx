'use client';

import { useEffect, useRef, useState } from 'react';
import { CurrencyFlagIcon } from '@/components/icons/currency-flag-icon';
import { CURRENCY_META, DISPLAY_CURRENCIES, type DisplayCurrency } from '@/lib/currency';
import { useCurrency } from '@/components/providers/currency-provider';

function CurrencyLabel({ code }: { code: DisplayCurrency }) {
  const meta = CURRENCY_META[code];

  return (
    <span className="inline-flex items-center gap-2.5">
      <CurrencyFlagIcon currency={code} />
      <span>{meta.label}</span>
    </span>
  );
}

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="border border-[var(--oc-line)] bg-[var(--oc-bg)] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--oc-ink)] transition hover:opacity-60"
      >
        <CurrencyLabel code={currency} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Currency"
          className="absolute bottom-full right-0 mb-2 min-w-full border border-[var(--oc-line)] bg-[var(--oc-bg)] shadow-[var(--oc-shadow-lift)]"
        >
          {DISPLAY_CURRENCIES.map((code) => (
            <li key={code} role="option" aria-selected={currency === code}>
              <button
                type="button"
                onClick={() => {
                  setCurrency(code);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-[0.22em] transition ${
                  currency === code ? 'text-[var(--oc-ink)]' : 'text-[var(--oc-muted)] hover:text-[var(--oc-ink)]'
                }`}
              >
                <CurrencyLabel code={code} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
