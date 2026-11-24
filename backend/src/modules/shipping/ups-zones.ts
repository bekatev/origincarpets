/** UPS Express Saver zones from the Origin Carpets rate card (Tbilisi origin). */
export type UpsRateZone =
  | 'GE_DOMESTIC'
  | 'ZONE_1'
  | 'ZONE_2_3'
  | 'ZONE_4'
  | 'ZONE_5'
  | 'ZONE_6';

/** Zone 1 — Armenia, Azerbaijan, Kazakhstan (+ regional CIS neighbor Russia). */
const ZONE_1 = new Set(['AM', 'AZ', 'KZ', 'RU']);

/**
 * Zones 2 & 3 — Europe, Great Britain, Turkey.
 * EU + UK + EFTA + TR + Ukraine.
 */
const ZONE_2_3 = new Set([
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
  'LI',
  // Listed on rate card
  'TR',
  'UA'
]);

/** Zone 4 — USA, Canada, Mexico. */
const ZONE_4 = new Set(['US', 'CA', 'MX']);

/**
 * Zone 5 — China, Korea, Australia, India, Israel
 * (+ nearby Asia / Oceania destinations we ship to).
 */
const ZONE_5 = new Set(['CN', 'KR', 'AU', 'IN', 'IL', 'JP', 'NZ', 'HK', 'SG', 'TW']);

/** Zone 6 — Saudi Arabia, Qatar, Kuwait, UAE. */
const ZONE_6 = new Set(['SA', 'QA', 'KW', 'AE']);

export function resolveUpsRateZone(countryCode: string): UpsRateZone {
  const code = countryCode.toUpperCase();

  if (code === 'GE') return 'GE_DOMESTIC';
  if (ZONE_1.has(code)) return 'ZONE_1';
  if (ZONE_2_3.has(code)) return 'ZONE_2_3';
  if (ZONE_4.has(code)) return 'ZONE_4';
  if (ZONE_5.has(code)) return 'ZONE_5';
  if (ZONE_6.has(code)) return 'ZONE_6';

  // Unlisted international destinations use Zone 5 rates.
  return 'ZONE_5';
}
