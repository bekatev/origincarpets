'use client';

import { useI18n } from '@/components/providers/i18n-provider';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';

const LOCALE_OPTIONS: Array<{ locale: Locale; label: string; flag: string }> = [
  { locale: 'en', label: 'English', flag: '🇬🇧' },
  { locale: 'ka', label: 'Georgian', flag: '🇬🇪' }
];

export function LanguageSwitcher() {
  const { locale, setLocale, dict } = useI18n();

  return (
    <div
      role="group"
      aria-label={dict.common.language}
      className="inline-flex items-center gap-0.5 rounded-full border border-[var(--oc-line)] bg-[var(--oc-bg)] p-0.5"
    >
      {LOCALE_OPTIONS.map((option) => {
        const active = locale === option.locale;
        return (
          <button
            key={option.locale}
            type="button"
            onClick={() => setLocale(option.locale)}
            aria-label={option.label}
            aria-pressed={active}
            title={option.label}
            className={cn(
              'inline-flex h-7 w-8 items-center justify-center rounded-full text-base leading-none transition',
              active
                ? 'bg-[var(--oc-bg-secondary)] shadow-sm ring-1 ring-[var(--oc-line)]'
                : 'opacity-55 hover:opacity-100'
            )}
          >
            <span aria-hidden>{option.flag}</span>
          </button>
        );
      })}
    </div>
  );
}
