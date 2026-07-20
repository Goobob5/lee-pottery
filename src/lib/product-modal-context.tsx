'use client';

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type ProductModalContextValue = {
  openId: string | null;
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
 * The param rides on whatever path the modal was opened from, but the canonical
 * URL we advertise (Share button, OpenGraph, sitemap) is always the collection
 * page — see `piecePath()` in `lib/site.ts`.
 */
export function ProductModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openId = searchParams.get('piece');

  const openProduct = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('piece', id);
      // scroll: false keeps the grid where it is while the modal opens over it.
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('piece');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

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
