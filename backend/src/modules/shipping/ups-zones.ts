/** UPS shipping zones from our Tbilisi gallery. */
export type UpsRateZone = 'GE_DOMESTIC' | 'AMERICA' | 'EUROPE' | 'REST_OF_WORLD';

/** North America — flat per-kg rate. */
const AMERICA_CODES = new Set(['US', 'CA']);

/** Europe — EU + UK + EFTA, priced in EUR per kg. */
const EUROPE_CODES = new Set([
  // EU
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
  'SE',
  // UK + EFTA + rest of geographic Europe
  'GB',
  'CH',
  'NO',
  'IS',
  'LI'
]);

export function resolveUpsRateZone(countryCode: string): UpsRateZone {
  const code = countryCode.toUpperCase();

  if (code === 'GE') {
    return 'GE_DOMESTIC';
  }
  if (AMERICA_CODES.has(code)) {
    return 'AMERICA';
  }
  if (EUROPE_CODES.has(code)) {
    return 'EUROPE';
  }

  return 'REST_OF_WORLD';
}
