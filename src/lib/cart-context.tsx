'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useCatalog } from './catalog-context';

type CartContextValue = {
  cartIds: string[];
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'lp-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { products } = useCatalog();
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) {
        // One-time hydration from a browser-only store (localStorage isn't available
        // during SSR), so this can't be computed as a lazy initial state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCartIds(saved.filter((id: string) => products.some((p) => p.id === id)));
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, [hydrated, products]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartIds));
    } catch {
      /* storage unavailable (private browsing, quota) — cart just won't persist */
    }
  }, [cartIds, hydrated]);

  const addToCart = useCallback((id: string) => {
    setCartIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);
  const removeFromCart = useCallback((id: string) => {
    setCartIds((prev) => prev.filter((x) => x !== id));
  }, []);
  const clearCart = useCallback(() => setCartIds([]), []);
  const isInCart = useCallback((id: string) => cartIds.includes(id), [cartIds]);

  return (
    <CartContext.Provider value={{ cartIds, addToCart, removeFromCart, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
