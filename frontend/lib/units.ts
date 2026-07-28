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

function formatMetricWeightKg(kg: number): string {
  const rounded = Number.isInteger(kg) ? String(kg) : String(Math.round(kg * 100) / 100);
  return `${rounded} kg`;
}

function formatImperialWeightLb(kg: number): string {
  const lbs = Math.round(kg * 2.20462 * 10) / 10;
  return `${lbs} lb`;
}

export function formatWeightFromKg(kg: number, system: MeasurementSystem): string {
  return system === 'imperial' ? formatImperialWeightLb(kg) : formatMetricWeightKg(kg);
}

/** Always show metric + imperial, e.g. "12.5 kg (27.6 lb)". */
export function formatWeightBothFromKg(kg: number): string {
  return `${formatMetricWeightKg(kg)} (${formatImperialWeightLb(kg)})`;
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

/** Always show cm + ft/in, e.g. "250 × 180 cm (8'2\" × 5'11\")". */
export function formatDimensionsBothFromCm(
  lengthCm: number,
  widthCm: number,
  metricUnitLabel = 'cm'
): string {
  const metric = `${lengthCm} × ${widthCm} ${metricUnitLabel}`;
  const imperial = `${formatLengthFromCm(lengthCm)} × ${formatLengthFromCm(widthCm)}`;
  return `${metric} (${imperial})`;
}
