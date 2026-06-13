import { apiRequest } from '@/lib/api';

export type SavedAddress = {
  id: string;
  deliveryCountryId: string | null;
  deliveryCityId: string | null;
  fullName: string;
  phone: string | null;
  region: string | null;
  postalCode: string | null;
  line1: string;
  line2: string | null;
  countryCode: string;
  city: string;
  isDefault: boolean;
};

export type AddressInput = {
  deliveryCountryId: string;
  deliveryCityId: string;
  fullName: string;
  phone?: string;
  region?: string;
  postalCode?: string;
  line1: string;
  line2?: string;
};

export type AccountProfile = {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  preferredPaymentMethod: 'CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY' | 'PAYPAL' | null;
  defaultShippingAddress: SavedAddress | null;
};

export function fetchAccountProfile(token: string) {
  return apiRequest<AccountProfile>('/users/me/profile', token);
}

export function updateAccountProfile(
  token: string,
  body: { preferredPaymentMethod?: AccountProfile['preferredPaymentMethod'] }
) {
  return apiRequest<AccountProfile>('/users/me/profile', token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export function listSavedAddresses(token: string) {
  return apiRequest<SavedAddress[]>('/users/me/addresses', token);
}

export function createSavedAddress(token: string, body: AddressInput) {
  return apiRequest<SavedAddress>('/users/me/addresses', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export function updateSavedAddress(token: string, addressId: string, body: AddressInput) {
  return apiRequest<SavedAddress>(`/users/me/addresses/${addressId}`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export function deleteSavedAddress(token: string, addressId: string) {
  return apiRequest<{ message: string }>(`/users/me/addresses/${addressId}`, token, {
    method: 'DELETE'
  });
}
