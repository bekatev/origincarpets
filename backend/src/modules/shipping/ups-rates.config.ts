import type { UpsRateZone } from './ups-zones';

/**
 * Per-kg shipping rates by zone.
 *
 * - Georgia (domestic): free
 * - Europe (EU/UK/EFTA): €10 per kg (converted to USD via USD_PER_EUR)
 * - All other countries: $20 per kg
 */
export type UpsPerKgRate = {
  amount: number;
  currency: 'USD' | 'EUR';
};

export const UPS_RATE_PER_KG: Record<UpsRateZone, UpsPerKgRate> = {
  GE_DOMESTIC: { amount: 0, currency: 'USD' },
  EUROPE: { amount: 10, currency: 'EUR' },
  REST_OF_WORLD: { amount: 20, currency: 'USD' }
};

/**
 * USD value of 1 EUR (overridable via USD_PER_EUR env).
 * Must match the storefront display rate: frontend uses 1 USD = 0.92 EUR,
 * so 1 EUR = 1/0.92 USD. That way €10/kg shows as exactly €50 for 5 kg.
 */
export const DEFAULT_USD_PER_EUR = 1 / 0.92;
