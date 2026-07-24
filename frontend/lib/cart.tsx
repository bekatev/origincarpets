'use client';

import { API_URL } from './api';
import { PURCHASE_ENABLED } from './storefront';
import { readStoredToken } from './auth';
import {
  clearCartStorage,
  clearLegacyCartStorage,
  fetchUserCart,
  GUEST_CART_OWNER,
  mergeCartItems,
  readCartFromStorage,
  writeCartToStorage,
  type StoredCartItem
} from './cart-sync';
import { useAuth } from '@/components/providers/auth-provider';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type CartProduct = {
  id: string;
  slug: string;
  title: string;
  price: number;
  image?: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeCartItems(items: CartItem[] | StoredCartItem[]): CartItem[] {
  return items.map((item) => ({ ...item, quantity: 1 }));
}

async function syncCartToBackend(items: CartItem[]): Promise<void> {
  const token = readStoredToken();
  if (!token) return;

  try {
    await fetch(`${API_URL}/cart/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity }))
      })
    });
  } catch {
    // Local state remains; next load will reconcile from the server.
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    async function loadCartForUser() {
      clearLegacyCartStorage();

      const guestItems = normalizeCartItems(readCartFromStorage(GUEST_CART_OWNER));

      if (!user) {
        if (!cancelled) {
          setItems(guestItems);
          setIsHydrated(true);
        }
        previousUserId.current = null;
        return;
      }

      // Logging in: merge any guest cart into the user cart once.
      const wasGuest = previousUserId.current === null || previousUserId.current === undefined;
      const localUserItems = normalizeCartItems(readCartFromStorage(user.id));
      let next = wasGuest && guestItems.length
        ? normalizeCartItems(mergeCartItems(localUserItems, guestItems))
        : localUserItems;

      if (!cancelled) {
        setItems(next);
        setIsHydrated(true);
        writeCartToStorage(user.id, next);
        if (guestItems.length) {
          clearCartStorage(GUEST_CART_OWNER);
        }
      }

      const token = readStoredToken();
      if (!token) {
        previousUserId.current = user.id;
        return;
      }

      try {
        const remoteItems = await fetchUserCart(token);
        if (cancelled) return;

        const merged = normalizeCartItems(
          mergeCartItems(remoteItems, wasGuest && guestItems.length ? guestItems : [])
        );
        setItems(merged);
        writeCartToStorage(user.id, merged);
        void syncCartToBackend(merged);
      } catch {
        // Keep the local cart that was shown immediately.
      }

      previousUserId.current = user.id;
    }

    void loadCartForUser();

    return () => {
      cancelled = true;
    };
  }, [authReady, user?.id]);

  useEffect(() => {
    if (!isHydrated) return;

    const ownerId = user?.id ?? GUEST_CART_OWNER;
    writeCartToStorage(ownerId, items);

    if (!user) return;

    const timer = window.setTimeout(() => {
      void syncCartToBackend(items);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [items, isHydrated, user?.id]);

  const addToCart = useCallback((product: CartProduct) => {
    if (!PURCHASE_ENABLED) return;

    setItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const isInCart = useCallback(
    (productId: string) => items.some((item) => item.id === productId),
    [items]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    clearCartStorage(user?.id ?? GUEST_CART_OWNER);
  }, [user?.id]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems: items.length,
      subtotal: items.reduce((sum, item) => sum + item.price, 0),
      addToCart,
      removeFromCart,
      clearCart,
      isInCart
    }),
    [items, addToCart, removeFromCart, clearCart, isInCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
