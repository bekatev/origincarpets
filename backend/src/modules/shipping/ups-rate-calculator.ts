import { type PackageDimensions } from './package-dimensions.util';
import {
  UPS_EXPRESS_SAVER_USD,
  UPS_OVER_10KG_STEP_USD,
  type UpsWeightStepKg
} from './ups-rates.config';
import { resolveUpsRateZone, type UpsRateZone } from './ups-zones';

export type UpsRateQuote = {
  zone: UpsRateZone;
  packageDimensions: PackageDimensions;
  chargeableWeightKg: number;
  /** Effective $/kg for display (price ÷ chargeable weight). */
  perKgUsd: number;
  priceUsd: number;
  freeShipping: boolean;
};

/** Round UP to the next 0.5 kg bracket (UPS-style), minimum 0.5 kg. */
export function chargeableWeightKg(weightKg: number): number {
  const safe = Math.max(weightKg || 0, 0);
  const rounded = Math.ceil(safe * 2) / 2;
  return Math.max(rounded, 0.5);
}

function priceForZone(zone: Exclude<UpsRateZone, 'GE_DOMESTIC'>, weightKg: number): number {
  const billable = chargeableWeightKg(weightKg);

  if (billable <= 10) {
    const step = billable as UpsWeightStepKg;
    return UPS_EXPRESS_SAVER_USD[zone][step];
  }

  const extraHalfKgSteps = Math.ceil((billable - 10) * 2);
  return UPS_EXPRESS_SAVER_USD[zone][10] + extraHalfKgSteps * UPS_OVER_10KG_STEP_USD[zone];
}

export function quoteUpsRate(input: {
  countryCode: string;
  packageDimensions: PackageDimensions;
  /** @deprecated Quotes use the fixed USD Express Saver table. */
  usdPerEur?: number;
}): UpsRateQuote {
  const zone = resolveUpsRateZone(input.countryCode);
  const weightKg = chargeableWeightKg(input.packageDimensions.weightKg);

  if (zone === 'GE_DOMESTIC') {
    return {
      zone,
      packageDimensions: input.packageDimensions,
      chargeableWeightKg: weightKg,
      perKgUsd: 0,
      priceUsd: 0,
      freeShipping: true
    };
  }

  const priceUsd = priceForZone(zone, weightKg);
  const perKgUsd = Math.round((priceUsd / weightKg) * 100) / 100;

  return {
    zone,
    packageDimensions: input.packageDimensions,
    chargeableWeightKg: weightKg,
    perKgUsd,
    priceUsd,
    freeShipping: false
  };
}
