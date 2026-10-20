/**
 * Marketing cookie consent (Meta Pixel / GA / Google Ads).
 * Opt-in is required only for EEA / UK / Switzerland visitors; everyone else is tracked
 * by default and can opt out. Umami is cookieless and does not require this gate.
 */

export const CONSENT_STORAGE_KEY = 'oc_cookie_consent';
export const CONSENT_COOKIE = 'oc_cookie_consent';
export const CONSENT_EVENT = 'oc-consent-changed';
export const CONSENT_RESET_EVENT = 'oc-consent-reset';

export type ConsentValue = 'accepted' | 'rejected';
/** Stored on orders so the server knows whether it may forward a Purchase to Meta. */
export type ConsentState = ConsentValue | 'implied' | 'pending';

/** ISO codes for Google Consent Mode — Google resolves the visitor's region by IP. */
export const CONSENT_REQUIRED_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO', 'GB', 'CH'
];

const NON_EEA_EUROPE_ZONES = new Set([
  'Europe/Moscow',
  'Europe/Kirov',
  'Europe/Volgograd',
  'Europe/Samara',
  'Europe/Ulyanovsk',
  'Europe/Saratov',
  'Europe/Astrakhan',
  'Europe/Kaliningrad',
  'Europe/Simferopol',
  'Europe/Istanbul',
  'Europe/Kiev',
  'Europe/Kyiv',
  'Europe/Minsk',
  'Europe/Chisinau'
]);

const EXTRA_EEA_ZONES = new Set([
  'Atlantic/Canary',
  'Atlantic/Madeira',
  'Atlantic/Azores',
  'Atlantic/Reykjavik',
  'Atlantic/Faroe',
  'Asia/Nicosia',
  'Asia/Famagusta'
]);

/**
 * Meta has no region-aware consent mode, so the browser time zone decides.
 * Unknown time zones are treated as opt-in regions.
 */
export function isConsentRequiredRegion(): boolean {
  if (typeof Intl === 'undefined') return true;
  let timeZone = '';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return true;
  }
  if (!timeZone) return true;
  if (EXTRA_EEA_ZONES.has(timeZone)) return true;
  return timeZone.startsWith('Europe/') && !NON_EEA_EUROPE_ZONES.has(timeZone);
}

export function readConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === 'accepted' || raw === 'rejected') return raw;
  } catch {
    // private mode
  }
  return null;
}

export function writeConsent(value: ConsentValue) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // ignore
  }
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Re-opens the banner (footer "Cookie settings"). */
export function openConsentSettings() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CONSENT_RESET_EVENT));
}

export function consentState(): ConsentState {
  const stored = readConsent();
  if (stored) return stored;
  return isConsentRequiredRegion() ? 'pending' : 'implied';
}

export function hasMarketingConsent(): boolean {
  const state = consentState();
  return state === 'accepted' || state === 'implied';
}
