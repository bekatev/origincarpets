import type { Request } from 'express';

export type OrderConsent = 'accepted' | 'rejected' | 'implied' | 'pending';

export type OrderAttribution = {
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
  capturedAt?: number;
  fbp?: string;
  fbc?: string;
  gaClientId?: string;
  consent?: OrderConsent;
  clientIp?: string;
  userAgent?: string;
};

export type RequestMeta = {
  clientIp?: string;
  userAgent?: string;
};

const STRING_KEYS = [
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'utmTerm',
  'fbclid',
  'gclid',
  'gbraid',
  'wbraid',
  'landingPage',
  'referrer',
  'fbp',
  'fbc',
  'gaClientId'
] as const;

const NUMBER_KEYS = ['fbclidAt', 'capturedAt'] as const;
const CONSENT_VALUES: OrderConsent[] = ['accepted', 'rejected', 'implied', 'pending'];

export function requestMetaFrom(req: Request): RequestMeta {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  const realIp = req.headers['x-real-ip'];
  const clientIp =
    forwardedIp || (Array.isArray(realIp) ? realIp[0] : realIp) || req.socket?.remoteAddress || undefined;
  const userAgent = req.headers['user-agent'] || undefined;
  return { clientIp, userAgent };
}

/** Keeps only known keys with bounded string lengths — the payload comes from the browser. */
export function sanitizeAttribution(
  raw: Record<string, unknown> | undefined,
  meta: RequestMeta
): OrderAttribution | null {
  const result: OrderAttribution = {};

  if (raw && typeof raw === 'object') {
    for (const key of STRING_KEYS) {
      const value = raw[key];
      if (typeof value === 'string' && value.trim()) {
        result[key] = value.trim().slice(0, 500);
      }
    }
    for (const key of NUMBER_KEYS) {
      const value = Number(raw[key]);
      if (Number.isFinite(value) && value > 0) {
        result[key] = Math.floor(value);
      }
    }
    if (typeof raw.consent === 'string' && CONSENT_VALUES.includes(raw.consent as OrderConsent)) {
      result.consent = raw.consent as OrderConsent;
    }
  }

  if (meta.clientIp) result.clientIp = meta.clientIp.slice(0, 100);
  if (meta.userAgent) result.userAgent = meta.userAgent.slice(0, 500);

  return Object.keys(result).length ? result : null;
}
