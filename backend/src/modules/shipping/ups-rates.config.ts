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

/** USD value of 1 EUR (overridable via USD_PER_EUR env). */
export const DEFAULT_USD_PER_EUR = 1.08;
