'use client';

import { LocaleFlagIcon } from '@/components/icons/locale-flag-icon';
import { useI18n } from '@/components/providers/i18n-provider';
import type { Locale } from '@/lib/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ka: 'Georgian'
};

export function LanguageSwitcher() {
  const { locale, setLocale, dict } = useI18n();
  const nextLocale: Locale = locale === 'en' ? 'ka' : 'en';

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      aria-label={`${dict.common.language}: ${LOCALE_LABELS[locale]}. Switch to ${LOCALE_LABELS[nextLocale]}.`}
      title={`${LOCALE_LABELS[locale]} → ${LOCALE_LABELS[nextLocale]}`}
      className="inline-flex items-center transition hover:opacity-60"
    >
      <LocaleFlagIcon locale={locale} />
    </button>
  );
}
