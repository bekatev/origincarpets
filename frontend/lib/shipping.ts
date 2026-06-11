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

export type DeliveryMethodKey = 'AVIA' | 'EMS' | 'CD-Parcel';

export type DeliveryMethod = {
  value: DeliveryMethodKey;
  gpostId: number;
  label: { en: string; ge: string };
  descTop: { en: string; ge: string };
  descBottom: { en: string; ge: string };
  minDeliveryDays: number;
  maxDeliveryDays: number;
  recommended?: boolean;
};

export type ShippingQuote = {
  providerKey: string;
  provider: string;
  deliveryMethod: DeliveryMethodKey;
  shippingZone: { id: string; code: string; name: string };
  shippingCost: number;
  shippingCostGel?: number;
  freeShipping?: boolean;
  isEstimate: boolean;
  deliveryDays: { min: number | null; max: number | null };
};

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
