'use client';

import { useI18n } from '@/components/providers/i18n-provider';
import type { Locale } from '@/lib/i18n';

const LOCALE_OPTIONS: Array<{ locale: Locale; code: string }> = [
  { locale: 'en', code: 'ENG' },
  { locale: 'ka', code: 'GEO' }
];

export function LanguageSwitcher() {
  const { locale, setLocale, dict } = useI18n();

  const active = LOCALE_OPTIONS.find((option) => option.locale === locale) ?? LOCALE_OPTIONS[0];
  const nextLocale: Locale = locale === 'en' ? 'ka' : 'en';
  const nextLabel = LOCALE_OPTIONS.find((option) => option.locale === nextLocale)?.code ?? 'GEO';

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      aria-label={`${dict.common.language}: ${active.code}. Switch to ${nextLabel}.`}
      className="oc-nav-link inline-flex items-center leading-none"
    >
      {active.code}
    </button>
  );
}
