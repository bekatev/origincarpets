import type { ShippingType } from './shipping.service';

export type ShippingProviderKey = 'georgian_post' | 'dhl_express';

export type ShippingMethodConfig = {
  type: ShippingType;
  providerKey: ShippingProviderKey;
  provider: string;
  zoneCode: string;
  zoneName: string;
  countryCode: string;
  basePrice: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
};

/** Domestic — Georgian Post (საქართველოს ფოსტა). */
export const GEORGIA_SHIPPING: ShippingMethodConfig = {
  type: 'GEORGIA',
  providerKey: 'georgian_post',
  provider: 'Georgian Post',
  zoneCode: 'GEORGIA',
  zoneName: 'Georgia',
  countryCode: 'GE',
  basePrice: 0,
  minDeliveryDays: 2,
  maxDeliveryDays: 5
};

/**
 * International — DHL Express.
 * Best fit for high-value carpets: express transit, door-to-door tracking,
 * and reliable customs clearance from Tbilisi worldwide.
 */
export const INTERNATIONAL_SHIPPING_BASE: Omit<ShippingMethodConfig, 'basePrice' | 'zoneCode' | 'zoneName' | 'countryCode'> = {
  type: 'INTERNATIONAL',
  providerKey: 'dhl_express',
  provider: 'DHL Express',
  minDeliveryDays: 5,
  maxDeliveryDays: 12
};

export const INTERNATIONAL_ZONE_PRICES: Record<string, { code: string; name: string; basePrice: number }> = {
  GE: { code: 'GEORGIA', name: 'Georgia', basePrice: 0 },
  US: { code: 'USA', name: 'United States', basePrice: 85 },
  CA: { code: 'USA', name: 'Canada', basePrice: 90 },
  GB: { code: 'UK', name: 'United Kingdom', basePrice: 75 },
  DE: { code: 'EU', name: 'Germany', basePrice: 65 },
  FR: { code: 'EU', name: 'France', basePrice: 65 },
  IT: { code: 'EU', name: 'Italy', basePrice: 65 },
  ES: { code: 'EU', name: 'Spain', basePrice: 65 },
  NL: { code: 'EU', name: 'Netherlands', basePrice: 65 },
  BE: { code: 'EU', name: 'Belgium', basePrice: 65 },
  AT: { code: 'EU', name: 'Austria', basePrice: 65 },
  PL: { code: 'EU', name: 'Poland', basePrice: 70 },
  CH: { code: 'EU', name: 'Switzerland', basePrice: 75 },
  AE: { code: 'MENA', name: 'United Arab Emirates', basePrice: 80 },
  JP: { code: 'ASIA', name: 'Japan', basePrice: 95 },
  CN: { code: 'ASIA', name: 'China', basePrice: 95 },
  KR: { code: 'ASIA', name: 'South Korea', basePrice: 95 },
  AU: { code: 'OCEANIA', name: 'Australia', basePrice: 110 }
};

export const DEFAULT_INTERNATIONAL_ZONE = {
  code: 'INTL_OTHER',
  name: 'International',
  basePrice: 95
};
