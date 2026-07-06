'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ProductModalContextValue = {
  openId: string | null;
  openProduct: (id: string) => void;
  closeModal: () => void;
};

const ProductModalContext = createContext<ProductModalContextValue | null>(null);

export function ProductModalProvider({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const openProduct = useCallback((id: string) => setOpenId(id), []);
  const closeModal = useCallback(() => setOpenId(null), []);

  useEffect(() => {
    if (!openId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId, closeModal]);

  const value = useMemo(() => ({ openId, openProduct, closeModal }), [openId, openProduct, closeModal]);

  return <ProductModalContext.Provider value={value}>{children}</ProductModalContext.Provider>;
}

export function useProductModal() {
  const ctx = useContext(ProductModalContext);
  if (!ctx) throw new Error('useProductModal must be used within a ProductModalProvider');
  return ctx;
}
