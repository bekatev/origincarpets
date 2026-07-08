/** UPS shipping zones from our Tbilisi gallery. */
export type UpsRateZone = 'GE_DOMESTIC' | 'EUROPE' | 'REST_OF_WORLD';

/** Europe — EU + UK + EFTA, priced at €10 per kg. */
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
  // UK + EFTA
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
  if (EUROPE_CODES.has(code)) {
    return 'EUROPE';
  }

  return 'REST_OF_WORLD';
}
