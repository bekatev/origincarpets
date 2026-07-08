import type { UpsRateZone } from './ups-zones';

/**
 * UPS pricing plan (per billable kg).
 *
 * Agreed rates:
 *  - Domestic (Georgia): free
 *  - America (US / Canada): $20 per kg
 *  - Europe (EU + UK): €10 per kg
 *
 * Other destinations fall back to the America rate and are flagged as an estimate
 * until a specific rate is agreed with UPS.
 */

/** EUR → USD conversion for the storefront (charged in USD). Adjust if the rate drifts. */
export const EUR_TO_USD = 1.1;

export type UpsZoneRate = {
  perKgUsd: number;
  freeShipping?: boolean;
  isEstimate?: boolean;
};

export const UPS_ZONE_RATES: Record<UpsRateZone, UpsZoneRate> = {
  GE_DOMESTIC: { perKgUsd: 0, freeShipping: true },
  US_CA: { perKgUsd: 20 },
  EU: { perKgUsd: 10 * EUR_TO_USD },
  UK: { perKgUsd: 10 * EUR_TO_USD },
  MIDDLE_EAST: { perKgUsd: 20, isEstimate: true },
  ASIA_PACIFIC: { perKgUsd: 20, isEstimate: true },
  REST_OF_WORLD: { perKgUsd: 20, isEstimate: true }
};
