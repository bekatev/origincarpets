import { API_URL } from './api';

export type StoredCartItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
};

const CART_STORAGE_PREFIX = 'carpet_cart_v1';
/** @deprecated Shared key caused carts to leak between users on the same browser. */
const LEGACY_CART_STORAGE_KEY = 'carpet_cart_v1';

type RemoteCartResponse = {
  items: Array<{
    quantity: number;
    product: { id: string; slug: string; title: string; price: number; image: string | null };
  }>;
};

export function cartStorageKey(userId: string): string {
  return `${CART_STORAGE_PREFIX}:${userId}`;
}

export function readCartFromStorage(userId: string): StoredCartItem[] {
  try {
    const raw = localStorage.getItem(cartStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCartToStorage(userId: string, items: StoredCartItem[]): void {
  localStorage.setItem(cartStorageKey(userId), JSON.stringify(items));
}

export function clearCartStorage(userId: string): void {
  localStorage.removeItem(cartStorageKey(userId));
}

export function clearLegacyCartStorage(): void {
  localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
}

function toCartItems(remote: RemoteCartResponse['items']): StoredCartItem[] {
  return (remote ?? []).map((entry) => ({
    id: entry.product.id,
    slug: entry.product.slug,
    title: entry.product.title,
    price: entry.product.price,
    image: entry.product.image ?? undefined,
    quantity: entry.quantity
  }));
}

export async function fetchUserCart(token: string): Promise<StoredCartItem[]> {
  const response = await fetch(`${API_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('Failed to load cart');
  }

  const remote = (await response.json()) as RemoteCartResponse;
  return toCartItems(remote.items);
}
