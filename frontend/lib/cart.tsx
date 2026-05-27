'use client';

import { API_URL } from './api';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'carpet_cart_v1';

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
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  try {
    await fetch(`${API_URL}/cart/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ items })
    });
  } catch {
    // Optional sync only; local cart remains source of truth for now.
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(parsed);
      }
    } catch {
      setItems([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    void syncCartToBackend(items);
  }, [items, isHydrated]);

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
  }, []);

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
