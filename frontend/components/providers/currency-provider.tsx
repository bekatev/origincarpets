'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  CURRENCY_COOKIE,
  formatMoney,
  normalizeCurrency,
  type DisplayCurrency
} from '@/lib/currency';

type CurrencyContextValue = {
  currency: DisplayCurrency;
  setCurrency: (currency: DisplayCurrency) => void;
  formatPrice: (amountUsd: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  initialCurrency,
  children
}: {
  initialCurrency: DisplayCurrency;
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>(initialCurrency);

  const setCurrency = useCallback((next: DisplayCurrency) => {
    const normalized = normalizeCurrency(next);
    setCurrencyState(normalized);
    document.cookie = `${CURRENCY_COOKIE}=${normalized}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const formatPrice = useCallback((amountUsd: number) => formatMoney(amountUsd, currency), [currency]);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      formatPrice
    }),
    [currency, setCurrency, formatPrice]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used inside CurrencyProvider');
  }
  return context;
}
