/** Product prices in the database are stored in USD (legacy Origin Carpets). */
export type DisplayCurrency = 'USD' | 'EUR' | 'GEL';

export const CURRENCY_COOKIE = 'site_currency';

export const DISPLAY_CURRENCIES: DisplayCurrency[] = ['USD', 'EUR', 'GEL'];

export const CURRENCY_META: Record<DisplayCurrency, { label: string }> = {
  USD: { label: 'USD' },
  EUR: { label: 'EUR' },
  GEL: { label: 'GEL' }
};

/** Approximate display rates from USD — update periodically for accuracy. */
const RATES_FROM_USD: Record<DisplayCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  GEL: 2.69
};

export function normalizeCurrency(value: string | undefined | null): DisplayCurrency {
  const upper = value?.toUpperCase();
  if (upper === 'EUR' || upper === 'GEL' || upper === 'USD') {
    return upper;
  }
  return 'USD';
}

export function convertFromUsd(amountUsd: number, target: DisplayCurrency): number {
  return amountUsd * RATES_FROM_USD[target];
}

export function formatMoney(amountUsd: number, currency: DisplayCurrency): string {
  const value = convertFromUsd(amountUsd, currency);
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  switch (currency) {
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    case 'GEL':
      return `₾${formatted}`;
  }
}
