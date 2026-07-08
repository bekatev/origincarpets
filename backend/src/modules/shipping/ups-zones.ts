/** UPS export zones from Georgia — replace with contract tariff zones when available. */
export type UpsRateZone =
  | 'GE_DOMESTIC'
  | 'EU'
  | 'US_CA'
  | 'UK'
  | 'MIDDLE_EAST'
  | 'ASIA_PACIFIC'
  | 'REST_OF_WORLD';

const EU_COUNTRY_CODES = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE'
]);

const MIDDLE_EAST_CODES = new Set(['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'IL', 'TR']);

const ASIA_PACIFIC_CODES = new Set([
  'AU',
  'NZ',
  'JP',
  'KR',
  'CN',
  'HK',
  'SG',
  'TH',
  'MY',
  'IN'
]);

export function resolveUpsRateZone(countryCode: string): UpsRateZone {
  const code = countryCode.toUpperCase();

  if (code === 'GE') {
    return 'GE_DOMESTIC';
  }
  if (code === 'US' || code === 'CA') {
    return 'US_CA';
  }
  if (code === 'GB') {
    return 'UK';
  }
  if (EU_COUNTRY_CODES.has(code)) {
    return 'EU';
  }
  if (MIDDLE_EAST_CODES.has(code)) {
    return 'MIDDLE_EAST';
  }
  if (ASIA_PACIFIC_CODES.has(code)) {
    return 'ASIA_PACIFIC';
  }

  return 'REST_OF_WORLD';
}
