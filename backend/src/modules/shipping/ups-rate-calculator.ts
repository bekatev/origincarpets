import type { UpsDeliveryMethodKey } from './ups.constants';
import { billableWeightKg, type PackageDimensions } from './package-dimensions.util';
import { UPS_ZONE_RATES } from './ups-rates.config';
import { resolveUpsRateZone, type UpsRateZone } from './ups-zones';

export type UpsRateQuote = {
  zone: UpsRateZone;
  method: UpsDeliveryMethodKey;
  packageDimensions: PackageDimensions;
  actualWeightKg: number;
  /** Volumetric weight (for packing reference only — not used for pricing). */
  billableWeightKg: number;
  /** Weight the price is calculated on (per-kg plan uses actual package weight). */
  chargeableWeightKg: number;
  perKgUsd: number;
  priceUsd: number;
  freeShipping: boolean;
  isEstimate: boolean;
};

export function quoteUpsRate(input: {
  countryCode: string;
  method: UpsDeliveryMethodKey;
  packageDimensions: PackageDimensions;
}): UpsRateQuote {
  const zone = resolveUpsRateZone(input.countryCode);
  const volumetric = billableWeightKg(input.packageDimensions);
  const actual = Math.max(input.packageDimensions.weightKg, 0.5);
  const chargeable = Math.round(actual * 100) / 100;
  const zoneRate = UPS_ZONE_RATES[zone];

  const freeShipping = Boolean(zoneRate.freeShipping);
  const priceUsd = freeShipping ? 0 : Math.round(zoneRate.perKgUsd * chargeable * 100) / 100;

  return {
    zone,
    method: input.method,
    packageDimensions: input.packageDimensions,
    actualWeightKg: input.packageDimensions.weightKg,
    billableWeightKg: volumetric,
    chargeableWeightKg: chargeable,
    perKgUsd: zoneRate.perKgUsd,
    priceUsd,
    freeShipping,
    isEstimate: Boolean(zoneRate.isEstimate)
  };
}
