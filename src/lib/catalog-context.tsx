'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { Product } from './products';

type CatalogContextValue = {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

/** Makes the server-fetched catalog available to client components. */
export function CatalogProvider({
  products,
  children,
}: {
  products: Product[];
  children: React.ReactNode;
}) {
  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );
  const value = useMemo(() => ({ products, getProduct }), [products, getProduct]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within a CatalogProvider');
  return ctx;
}
