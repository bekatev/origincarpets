import { API_URL } from '@/lib/api';

export type DeliveryCountry = {
  id: string;
  gpostId: number;
  abbr: string;
  nameEn: string;
  nameGe: string | null;
};

export type DeliveryCity = {
  id: string;
  gpostId: number;
  nameEn: string;
  nameGe: string | null;
};

export type DeliveryMethodKey = 'UPS_WORLDWIDE';

export type DeliveryMethod = {
  value: DeliveryMethodKey;
  label: { en: string; ge: string };
  descTop: { en: string; ge: string };
  descBottom: { en: string; ge: string };
  minDeliveryDays: number;
  maxDeliveryDays: number;
  recommended?: boolean;
};

export type ShippingProviderInfo = {
  providerKey: string;
  provider: string;
  live: boolean;
  domesticOnly: boolean;
  manualFulfillment: boolean;
  description: string;
};

export type ShippingQuote = {
  providerKey: string;
  provider: string;
  deliveryMethod: DeliveryMethodKey;
  shippingZone: { id: string; code: string; name: string };
  shippingCost: number;
  merchantShippingCostUsd?: number;
  freeShipping?: boolean;
  isEstimate: boolean;
  deliveryDays: { min: number | null; max: number | null };
  package?: {
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    chargeableWeightKg: number;
    perKgUsd: number;
  };
};

export async function fetchShippingProvider(): Promise<ShippingProviderInfo> {
  const response = await fetch(`${API_URL}/shipping/provider`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load shipping provider');
  }
  return response.json() as Promise<ShippingProviderInfo>;
}

export async function fetchDeliveryCountries(): Promise<DeliveryCountry[]> {
  const response = await fetch(`${API_URL}/shipping/countries`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load delivery countries');
  }
  return response.json() as Promise<DeliveryCountry[]>;
}

export async function fetchDeliveryCities(countryId: string): Promise<DeliveryCity[]> {
  const response = await fetch(`${API_URL}/shipping/cities?countryId=${encodeURIComponent(countryId)}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Failed to load delivery cities');
  }
  return response.json() as Promise<DeliveryCity[]>;
}

export async function fetchDeliveryMethods(countryId: string): Promise<DeliveryMethod[]> {
  const response = await fetch(`${API_URL}/shipping/methods?countryId=${encodeURIComponent(countryId)}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Failed to load delivery methods');
  }
  return response.json() as Promise<DeliveryMethod[]>;
}

export async function fetchShippingQuote(input: {
  items: Array<{ productId: string; quantity: number }>;
  deliveryCountryId: string;
  deliveryCityId: string;
  deliveryMethod: DeliveryMethodKey;
}): Promise<ShippingQuote> {
  const response = await fetch(`${API_URL}/shipping/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = (await response.json()) as ShippingQuote & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? 'Failed to calculate shipping');
  }

  return payload;
}

/** Placeholder cities (customer types their own city) use a high synthetic id. */
const PLACEHOLDER_CITY_BASE = 900_000_000;

export function isInternationalCityList(cities: DeliveryCity[]) {
  return cities.length === 1 && (cities[0]?.gpostId ?? 0) >= PLACEHOLDER_CITY_BASE;
}
