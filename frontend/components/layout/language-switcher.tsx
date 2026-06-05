'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/providers/i18n-provider';
import type { Locale } from '@/lib/i18n';

const LOCALE_OPTIONS: Array<{ locale: Locale; code: string }> = [
  { locale: 'en', code: 'ENG' },
  { locale: 'ka', code: 'GEO' }
];

export function LanguageSwitcher() {
  const { locale, setLocale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const active = LOCALE_OPTIONS.find((option) => option.locale === locale) ?? LOCALE_OPTIONS[0];

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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={dict.common.language}
        className="oc-nav-link"
      >
        {active.code}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={dict.common.language}
          className="absolute right-0 top-full z-50 mt-2 min-w-[5rem] border border-[var(--oc-line)] bg-[var(--oc-bg)]"
        >
          {LOCALE_OPTIONS.map((option) => (
            <li key={option.locale} role="option" aria-selected={locale === option.locale}>
              <button
                type="button"
                onClick={() => {
                  if (option.locale !== locale) {
                    setLocale(option.locale);
                  }
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-[0.22em] transition ${
                  locale === option.locale ? 'text-[var(--oc-ink)]' : 'text-[var(--oc-muted)] hover:text-[var(--oc-ink)]'
                }`}
              >
                {option.code}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
