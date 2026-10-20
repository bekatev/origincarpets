import { consentState, type ConsentState } from '@/lib/consent';

/**
 * Last ad click / campaign that brought the visitor in, kept for 90 days in localStorage
 * and attached to the order so paid orders can be matched back to Meta / Google campaigns.
 */

const STORAGE_KEY = 'oc_attribution';
const TTL_MS = 90 * 24 * 60 * 60 * 1000;

const PARAM_MAP = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_content: 'utmContent',
  utm_term: 'utmTerm',
  fbclid: 'fbclid',
  gclid: 'gclid',
  gbraid: 'gbraid',
  wbraid: 'wbraid'
} as const;

type StoredAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  fbclidAt?: number;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  landingPage?: string;
  referrer?: string;
  capturedAt: number;
};

export type OrderAttributionPayload = Omit<StoredAttribution, 'capturedAt'> & {
  capturedAt?: number;
  fbp?: string;
  fbc?: string;
  gaClientId?: string;
  consent: ConsentState;
};

function readStored(): StoredAttribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAttribution;
    if (!parsed?.capturedAt || Date.now() - parsed.capturedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function externalReferrer(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    const ref = new URL(document.referrer);
    return ref.hostname === window.location.hostname ? undefined : document.referrer;
  } catch {
    return undefined;
  }
}

/** Call on every navigation; overwrites only when the URL carries campaign / click params. */
export function captureAttribution() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const next: StoredAttribution = { capturedAt: Date.now() };
  let hasCampaign = false;

  for (const [param, key] of Object.entries(PARAM_MAP)) {
    const value = params.get(param)?.trim();
    if (value) {
      next[key] = value.slice(0, 500);
      hasCampaign = true;
    }
  }

  try {
    if (hasCampaign) {
      if (next.fbclid) next.fbclidAt = next.capturedAt;
      next.landingPage = window.location.href.slice(0, 500);
      next.referrer = externalReferrer();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return;
    }

    const referrer = externalReferrer();
    if (referrer && !readStored()) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ capturedAt: next.capturedAt, referrer, landingPage: window.location.href.slice(0, 500) })
      );
    }
  } catch {
    // storage unavailable
  }
}

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** `_ga` is `GA1.1.<random>.<timestamp>` — GA4 client_id is the last two parts. */
function gaClientId(): string | undefined {
  const raw = readCookie('_ga');
  if (!raw) return undefined;
  const parts = raw.split('.');
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : undefined;
}

export function getAttributionForOrder(): OrderAttributionPayload | undefined {
  if (typeof window === 'undefined') return undefined;
  const stored = readStored();
  const payload: OrderAttributionPayload = {
    ...(stored ?? {}),
    fbp: readCookie('_fbp'),
    fbc: readCookie('_fbc'),
    gaClientId: gaClientId(),
    consent: consentState()
  };
  return payload;
}
