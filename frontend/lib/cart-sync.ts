import { API_URL } from './api';

type LocalCartItem = {
  id: string;
  quantity: number;
};

type RemoteCartResponse = {
  items: Array<{
    quantity: number;
    product: { id: string; slug: string; title: string; price: number; image: string | null };
  }>;
};

const CART_STORAGE_KEY = 'carpet_cart_v1';

function getLocalCart(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{ id: string; quantity: number }>;
    return parsed.map((item) => ({ id: item.id, quantity: Math.max(1, Math.floor(item.quantity)) }));
  } catch {
    return [];
  }
}

function toLocalStorageShape(remote: RemoteCartResponse['items']) {
  return remote.map((entry) => ({
    id: entry.product.id,
    slug: entry.product.slug,
    title: entry.product.title,
    price: entry.product.price,
    image: entry.product.image ?? undefined,
    quantity: entry.quantity
  }));
}

export async function mergeLocalCartAfterAuth(token: string): Promise<void> {
  const local = getLocalCart();

  const [remoteRes] = await Promise.all([
    fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  ]);

  const remote = (await remoteRes.json()) as RemoteCartResponse;

  const merged = new Map<string, number>();
  for (const item of remote.items ?? []) {
    merged.set(item.product.id, Math.max(1, Math.floor(item.quantity)));
  }
  for (const item of local) {
    merged.set(item.id, Math.min(99, (merged.get(item.id) ?? 0) + item.quantity));
  }

  const syncPayload = {
    items: Array.from(merged.entries()).map(([productId, quantity]) => ({ productId, quantity }))
  };

  const syncRes = await fetch(`${API_URL}/cart/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(syncPayload)
  });

  if (!syncRes.ok) {
    return;
  }

  const synced = (await syncRes.json()) as RemoteCartResponse;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toLocalStorageShape(synced.items ?? [])));
}
