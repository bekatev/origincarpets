'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { LANG_COOKIE, dictionaries, normalizeLocale, type Dictionary, type Locale } from '@/lib/i18n';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const value = useMemo<I18nContextValue>(() => {
    return {
      locale,
      setLocale: (nextLocale: Locale) => {
        const normalized = normalizeLocale(nextLocale);
        setLocaleState(normalized);
        document.cookie = `${LANG_COOKIE}=${normalized}; path=/; max-age=31536000; samesite=lax`;
        window.location.reload();
      },
      dict: dictionaries[locale]
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}
