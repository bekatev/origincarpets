'use client';

import { API_URL } from './api';
import { readStoredToken } from './auth';
import {
  clearCartStorage,
  clearLegacyCartStorage,
  fetchUserCart,
  readCartFromStorage,
  writeCartToStorage
} from './cart-sync';
import { useAuth } from '@/components/providers/auth-provider';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
  addToCart: (product: CartProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(99, quantity));
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

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    async function loadCartForUser() {
      setIsHydrated(false);
      clearLegacyCartStorage();

      if (!user) {
        setItems([]);
        setIsHydrated(true);
        return;
      }

      const token = readStoredToken();

      try {
        if (token) {
          const remoteItems = await fetchUserCart(token);
          if (!cancelled) {
            setItems(remoteItems);
            writeCartToStorage(user.id, remoteItems);
          }
        } else if (!cancelled) {
          setItems(readCartFromStorage(user.id));
        }
      } catch {
        if (!cancelled) {
          setItems(readCartFromStorage(user.id));
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    }

    void loadCartForUser();

    return () => {
      cancelled = true;
    };
  }, [authReady, user?.id]);

  useEffect(() => {
    if (!isHydrated || !user) return;

    writeCartToStorage(user.id, items);
    void syncCartToBackend(items);
  }, [items, isHydrated, user?.id]);

  const addToCart = useCallback((product: CartProduct, quantity = 1) => {
    const qty = clampQuantity(quantity);
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: clampQuantity(item.quantity + qty) } : item
        );
      }

      return [...prev, { ...product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: clampQuantity(quantity) } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (user) {
      clearCartStorage(user.id);
    }
  }, [user]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart]
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
