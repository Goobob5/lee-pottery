'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type ProductModalContextValue = {
  openProduct: (id: string) => void;
  closeModal: () => void;
};

const ProductModalContext = createContext<ProductModalContextValue | null>(null);

/**
 * The open piece is stored in the URL as `?piece=<id>` rather than local state,
 * so every piece has a shareable, linkable address. This gives us, for free:
 *
 *  - cold loads (`/collection?piece=estuary-bowl`) open straight to the piece;
 *  - the browser back button closes the detail;
 *  - a copied address bar (or the modal's Share button) is honest.
 *
 * `PieceModal` reads the param (via `useSearchParams`, behind a Suspense
 * boundary so it doesn't opt the statically-rendered pages into client-side
 * rendering); this provider only supplies the navigation helpers. They read the
 * live location at call time, so no search-param hook is needed here — which is
 * what keeps the shared site layout static.
 *
 * The param rides on whatever path the modal was opened from, but the canonical
 * URL we advertise (Share button, OpenGraph, sitemap) is always the collection
 * page — see `piecePath()` in `lib/site.ts`.
 */
export function ProductModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const openProduct = useCallback(
    (id: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set('piece', id);
      // scroll: false keeps the grid where it is while the modal opens over it.
      router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete('piece');
    const qs = params.toString();
    router.push(qs ? `${window.location.pathname}?${qs}` : window.location.pathname, { scroll: false });
  }, [router]);

  const value = useMemo(() => ({ openProduct, closeModal }), [openProduct, closeModal]);

  return <ProductModalContext.Provider value={value}>{children}</ProductModalContext.Provider>;
}

export function useProductModal() {
  const ctx = useContext(ProductModalContext);
  if (!ctx) throw new Error('useProductModal must be used within a ProductModalProvider');
  return ctx;
}
