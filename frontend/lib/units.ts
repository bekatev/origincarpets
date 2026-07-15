import type { DisplayCurrency } from '@/lib/currency';

export type MeasurementSystem = 'metric' | 'imperial';

export function measurementSystemForCurrency(currency: DisplayCurrency): MeasurementSystem {
  return currency === 'USD' ? 'imperial' : 'metric';
}

/** Convert centimetres to a compact feet/inches string, e.g. 7'6". */
export function formatLengthFromCm(cm: number): string {
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);

  if (inches === 12) {
    feet += 1;
    inches = 0;
  }

  if (feet <= 0) {
    return `${inches}"`;
  }

  return inches === 0 ? `${feet}'` : `${feet}'${inches}"`;
}

export function formatWeightFromKg(kg: number, system: MeasurementSystem): string {
  if (system === 'imperial') {
    const lbs = Math.round(kg * 2.20462 * 10) / 10;
    return `${lbs} lb`;
  }

  const rounded = Number.isInteger(kg) ? String(kg) : String(Math.round(kg * 100) / 100);
  return `${rounded} kg`;
}

export function formatDimensionsFromCm(
  lengthCm: number,
  widthCm: number,
  system: MeasurementSystem,
  metricUnitLabel = 'cm'
): string {
  if (system === 'imperial') {
    return `${formatLengthFromCm(lengthCm)} × ${formatLengthFromCm(widthCm)}`;
  }

  return `${lengthCm} × ${widthCm} ${metricUnitLabel}`;
}
