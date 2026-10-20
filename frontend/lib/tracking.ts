/**
 * Client-side ad / analytics tracking (Meta Pixel + GA4 + Google Ads).
 * Renders and fires only when env IDs are configured and marketing consent is granted.
 */

import {
  CONSENT_REQUIRED_REGIONS,
  hasMarketingConsent,
  readConsent,
  type ConsentValue
} from '@/lib/consent';

export type TrackingCurrency = 'USD' | 'EUR' | 'GEL';

export type TrackingItem = {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
};

export type TrackingPayload = {
  contentIds: string[];
  contentName?: string;
  contentType?: 'product' | 'product_group';
  value?: number;
  currency?: TrackingCurrency;
  contents?: TrackingItem[];
  /** Shared with CAPI for deduplication */
  eventId?: string;
  orderId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
};

const PENDING_PURCHASE_KEY = 'oc_pending_purchase';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getMetaPixelId(): string {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';
}

export function getGaMeasurementId(): string {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '';
}

export function getGoogleAdsId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || '';
}

export function getGoogleAdsPurchaseLabel(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL?.trim() || '';
}

/** Meta has no consent mode with modeling, so browser events are sent only with consent. */
function metaAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  if (!getMetaPixelId()) return false;
  return hasMarketingConsent();
}

/** Google Consent Mode decides what gtag stores/sends; denied visitors produce cookieless pings. */
function gtagReady(): boolean {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return false;
  return Boolean(getGaMeasurementId() || getGoogleAdsId());
}

const GOOGLE_CONSENT_GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted'
} as const;

const GOOGLE_CONSENT_DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied'
} as const;

let scriptsInitialized = false;

function injectScript(src: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

/** Loads Meta Pixel + gtag once. Consent defaults are queued before any config call. */
export function initTrackingScripts() {
  if (typeof window === 'undefined' || scriptsInitialized) return;
  scriptsInitialized = true;

  const pixelId = getMetaPixelId();
  const gaId = getGaMeasurementId();
  const adsId = getGoogleAdsId();
  const stored = readConsent();

  if (gaId || adsId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // gtag.js expects the Arguments object, not an array.
      window.dataLayer!.push(arguments);
    };
    window.gtag('consent', 'default', {
      ...GOOGLE_CONSENT_DENIED,
      region: CONSENT_REQUIRED_REGIONS,
      wait_for_update: 500
    });
    window.gtag('consent', 'default', GOOGLE_CONSENT_GRANTED);
    if (stored) {
      window.gtag('consent', 'update', stored === 'accepted' ? GOOGLE_CONSENT_GRANTED : GOOGLE_CONSENT_DENIED);
    }
    window.gtag('js', new Date());
    if (gaId) window.gtag('config', gaId, { send_page_view: false });
    if (adsId) window.gtag('config', adsId, { allow_enhanced_conversions: true });
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${gaId || adsId}`);
  }

  if (pixelId) {
    type FbqStub = ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[];
      push: unknown;
      loaded: boolean;
      version: string;
    };
    if (!window.fbq) {
      const stub = function (...args: unknown[]) {
        if (stub.callMethod) stub.callMethod(...args);
        else stub.queue.push(args);
      } as FbqStub;
      stub.queue = [];
      stub.push = stub;
      stub.loaded = true;
      stub.version = '2.0';
      window.fbq = stub;
      window._fbq = stub;
      injectScript('https://connect.facebook.net/en_US/fbevents.js');
    }
    window.fbq('consent', hasMarketingConsent() ? 'grant' : 'revoke');
    window.fbq('init', pixelId);
  }
}

/** Propagates a banner choice to Meta + Google without reloading. */
export function applyConsentChoice(value: ConsentValue) {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') {
    window.fbq('consent', value === 'accepted' ? 'grant' : 'revoke');
  }
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', value === 'accepted' ? GOOGLE_CONSENT_GRANTED : GOOGLE_CONSENT_DENIED);
  }
}

/** Google expects E.164; free-text phones without a country prefix are skipped. */
function e164(phone?: string): string | undefined {
  if (!phone) return undefined;
  const trimmed = phone.trim();
  if (!trimmed.startsWith('+')) return undefined;
  const digits = trimmed.replace(/[^\d]/g, '');
  return digits.length >= 8 ? `+${digits}` : undefined;
}

function newEventId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function metaCustomData(payload: TrackingPayload) {
  return {
    content_ids: payload.contentIds,
    content_type: payload.contentType ?? 'product',
    ...(payload.contentName ? { content_name: payload.contentName } : {}),
    ...(payload.value != null ? { value: payload.value } : {}),
    ...(payload.currency ? { currency: payload.currency } : {}),
    ...(payload.contents?.length
      ? {
          contents: payload.contents.map((item) => ({
            id: item.id,
            quantity: item.quantity ?? 1,
            ...(item.price != null ? { item_price: item.price } : {})
          }))
        }
      : {})
  };
}

function gaItems(payload: TrackingPayload) {
  if (payload.contents?.length) {
    return payload.contents.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity ?? 1
    }));
  }
  return payload.contentIds.map((id) => ({
    item_id: id,
    quantity: 1
  }));
}

function fireMeta(eventName: string, payload: TrackingPayload, eventId: string) {
  if (!metaAllowed()) return;
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', eventName, metaCustomData(payload), { eventID: eventId });
}

function fireGa(eventName: string, params: Record<string, unknown>) {
  if (!gtagReady()) return;
  window.gtag!('event', eventName, params);
}

function setGoogleUserData(payload: TrackingPayload) {
  if (!gtagReady()) return;
  const email = payload.email?.trim().toLowerCase();
  const phone = e164(payload.phone);
  if (!email && !phone) return;
  window.gtag!('set', 'user_data', {
    ...(email ? { email } : {}),
    ...(phone ? { phone_number: phone } : {})
  });
}

function fireGoogleAdsPurchase(payload: TrackingPayload) {
  const adsId = getGoogleAdsId();
  const label = getGoogleAdsPurchaseLabel();
  if (!adsId || !label) return;
  if (!gtagReady()) return;
  window.gtag!('event', 'conversion', {
    send_to: `${adsId}/${label}`,
    value: payload.value,
    currency: payload.currency ?? 'USD',
    transaction_id: payload.orderId ?? payload.eventId
  });
}

/** Best-effort server mirror for Meta CAPI (deduped via eventId). */
function mirrorToCapi(
  eventName: string,
  payload: TrackingPayload,
  eventId: string,
  eventSourceUrl?: string
) {
  if (!metaAllowed()) return;

  const body = {
    eventName,
    eventId,
    eventSourceUrl: eventSourceUrl || window.location.href,
    email: payload.email,
    phone: payload.phone,
    firstName: payload.firstName,
    lastName: payload.lastName,
    customData: {
      content_ids: payload.contentIds,
      content_type: payload.contentType ?? 'product',
      content_name: payload.contentName,
      value: payload.value,
      currency: payload.currency ?? 'USD',
      order_id: payload.orderId,
      contents: payload.contents?.map((item) => ({
        id: item.id,
        quantity: item.quantity ?? 1,
        item_price: item.price
      }))
    }
  };

  void fetch('/api/meta/capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true
  }).catch(() => {
    // Non-blocking — browser pixel remains source of truth if CAPI fails.
  });
}

export function trackMetaPageView() {
  if (!metaAllowed() || typeof window.fbq !== 'function') return;
  window.fbq('track', 'PageView');
}

export function trackPageView() {
  trackMetaPageView();
  fireGa('page_view', {
    page_location: window.location.href,
    page_path: window.location.pathname
  });
}

export function trackViewContent(payload: TrackingPayload) {
  const eventId = payload.eventId ?? newEventId('vc');
  fireMeta('ViewContent', payload, eventId);
  fireGa('view_item', {
    currency: payload.currency ?? 'USD',
    value: payload.value,
    items: gaItems(payload)
  });
  mirrorToCapi('ViewContent', payload, eventId);
}

export function trackAddToCart(payload: TrackingPayload) {
  const eventId = payload.eventId ?? newEventId('atc');
  fireMeta('AddToCart', payload, eventId);
  fireGa('add_to_cart', {
    currency: payload.currency ?? 'USD',
    value: payload.value,
    items: gaItems(payload)
  });
  mirrorToCapi('AddToCart', payload, eventId);
}

export function trackInitiateCheckout(payload: TrackingPayload) {
  const eventId = payload.eventId ?? newEventId('ic');
  fireMeta('InitiateCheckout', payload, eventId);
  fireGa('begin_checkout', {
    currency: payload.currency ?? 'USD',
    value: payload.value,
    items: gaItems(payload)
  });
  mirrorToCapi('InitiateCheckout', payload, eventId);
}

export function trackLead(payload: TrackingPayload & { contentName?: string } = { contentIds: [] }) {
  const eventId = payload.eventId ?? newEventId('lead');
  const normalized: TrackingPayload = {
    ...payload,
    contentIds: payload.contentIds.length ? payload.contentIds : ['lead'],
    contentName: payload.contentName ?? 'Lead'
  };
  fireMeta('Lead', normalized, eventId);
  fireGa('generate_lead', {
    currency: normalized.currency ?? 'USD',
    value: normalized.value
  });
  mirrorToCapi('Lead', normalized, eventId);
}

export function trackCompleteRegistration(payload: TrackingPayload = { contentIds: ['register'] }) {
  const eventId = payload.eventId ?? newEventId('reg');
  const normalized: TrackingPayload = {
    ...payload,
    contentIds: payload.contentIds.length ? payload.contentIds : ['register'],
    contentName: payload.contentName ?? 'CompleteRegistration'
  };
  fireMeta('CompleteRegistration', normalized, eventId);
  fireGa('sign_up', { method: 'email' });
  mirrorToCapi('CompleteRegistration', normalized, eventId);
}

export function trackPurchase(payload: TrackingPayload) {
  const eventId = payload.eventId ?? payload.orderId ?? newEventId('purchase');
  fireMeta('Purchase', payload, eventId);
  setGoogleUserData(payload);
  fireGa('purchase', {
    transaction_id: payload.orderId ?? eventId,
    currency: payload.currency ?? 'USD',
    value: payload.value,
    items: gaItems(payload)
  });
  fireGoogleAdsPurchase(payload);
  mirrorToCapi('Purchase', payload, eventId);
}

export type PendingPurchase = TrackingPayload & {
  eventId: string;
  stashedAt: number;
};

/** Call right before redirecting to iPay so Purchase can fire on /checkout/result. */
export function stashPendingPurchase(payload: TrackingPayload & { orderId: string }) {
  if (typeof window === 'undefined') return;
  const pending: PendingPurchase = {
    ...payload,
    eventId: payload.eventId ?? payload.orderId,
    currency: payload.currency ?? 'USD',
    stashedAt: Date.now()
  };
  try {
    sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(pending));
  } catch {
    // ignore quota / private mode
  }
}

/** Fire Purchase once after successful payment return (backup to server CAPI). */
export function flushPendingPurchase(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(PENDING_PURCHASE_KEY);
    if (!raw) return false;
    sessionStorage.removeItem(PENDING_PURCHASE_KEY);
    const pending = JSON.parse(raw) as PendingPurchase;
    // Ignore stale stashes (> 24h)
    if (!pending?.eventId || Date.now() - (pending.stashedAt || 0) > 86_400_000) {
      return false;
    }
    trackPurchase(pending);
    return true;
  } catch {
    return false;
  }
}

export function clearPendingPurchase() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(PENDING_PURCHASE_KEY);
  } catch {
    // ignore
  }
}

export function cartPayloadFromItems(
  items: Array<{ id: string; slug: string; title: string; price: number; quantity?: number }>,
  extras?: Partial<TrackingPayload>
): TrackingPayload {
  const contents = items.map((item) => ({
    id: item.slug || item.id,
    name: item.title,
    price: item.price,
    quantity: item.quantity ?? 1
  }));
  const value = contents.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);
  return {
    contentIds: contents.map((item) => item.id),
    contentType: 'product',
    value,
    currency: 'USD',
    contents,
    ...extras
  };
}
