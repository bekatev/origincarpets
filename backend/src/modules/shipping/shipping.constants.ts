export const SHIPPING_PROVIDER = 'Georgian Post';
export const SHIPPING_PROVIDER_KEY = 'georgian_post' as const;

/** Domestic deliveries — customer pays $0; merchant covers Georgian Post cost. */
export const FREE_SHIPPING_COUNTRY_CODE = 'GE';

/** Storefront checkout: Georgia domestic only until international shipping launches. */
export const DOMESTIC_DELIVERY_ONLY = true;

/** Fallback USD estimates when GP API is unavailable (dev / outage). */
export const FALLBACK_SHIPPING_USD = {
  domestic: 0,
  international: 95
} as const;
