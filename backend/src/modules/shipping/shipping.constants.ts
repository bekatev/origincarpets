export const SHIPPING_PROVIDER = 'UPS';
export const SHIPPING_PROVIDER_KEY = 'ups' as const;

/** Domestic deliveries — customer pays $0; merchant covers UPS cost. */
export const FREE_SHIPPING_COUNTRY_CODE = 'GE';

/**
 * When false (default), checkout only offers Georgia. Set SHIPPING_LIVE=true after UPS contract.
 * Also set NEXT_PUBLIC_PURCHASE_ENABLED=true on the frontend.
 */
export function isShippingLive(env: NodeJS.ProcessEnv = process.env) {
  return env.SHIPPING_LIVE === 'true' || env.SHIPPING_LIVE === '1';
}

/** Storefront checkout: Georgia only until international shipping launches. */
export function isDomesticDeliveryOnly(env: NodeJS.ProcessEnv = process.env) {
  return !isShippingLive(env);
}

/** Fallback USD estimates when rate table is not calibrated. */
export const FALLBACK_SHIPPING_USD = {
  domestic: 0,
  international: 120
} as const;
