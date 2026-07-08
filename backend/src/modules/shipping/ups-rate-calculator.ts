import { type PackageDimensions } from './package-dimensions.util';
import { DEFAULT_USD_PER_EUR, UPS_RATE_PER_KG } from './ups-rates.config';
import { resolveUpsRateZone, type UpsRateZone } from './ups-zones';

export type UpsRateQuote = {
  zone: UpsRateZone;
  packageDimensions: PackageDimensions;
  chargeableWeightKg: number;
  perKgUsd: number;
  priceUsd: number;
  freeShipping: boolean;
};

/** Chargeable weight is the combined actual package weight (min 0.5 kg). */
function chargeableWeight(packageDimensions: PackageDimensions) {
  return Math.max(Math.round(packageDimensions.weightKg * 100) / 100, 0.5);
}

export function quoteUpsRate(input: {
  countryCode: string;
  packageDimensions: PackageDimensions;
  usdPerEur?: number;
}): UpsRateQuote {
  const zone = resolveUpsRateZone(input.countryCode);
  const rate = UPS_RATE_PER_KG[zone];
  const usdPerEur = input.usdPerEur ?? DEFAULT_USD_PER_EUR;
  const perKgUsd = rate.currency === 'EUR' ? rate.amount * usdPerEur : rate.amount;
  const weightKg = chargeableWeight(input.packageDimensions);
  const priceUsd = Math.round(perKgUsd * weightKg * 100) / 100;

  return {
    zone,
    packageDimensions: input.packageDimensions,
    chargeableWeightKg: weightKg,
    perKgUsd: Math.round(perKgUsd * 100) / 100,
    priceUsd,
    freeShipping: zone === 'GE_DOMESTIC'
  };
}
