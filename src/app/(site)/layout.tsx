import { Suspense } from 'react';
import { getCatalog } from '@/lib/catalog';
import { CatalogProvider } from '@/lib/catalog-context';
import { CartProvider } from '@/lib/cart-context';
import { ProductModalProvider } from '@/lib/product-modal-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PieceModal from '@/components/PieceModal';

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const products = await getCatalog();

  return (
    <CatalogProvider products={products}>
      <CartProvider>
        <ProductModalProvider>
          <Header />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
          <Footer />
          {/* Suspense boundary: PieceModal reads the ?piece search param, which
              would otherwise opt the statically-rendered site pages into CSR. */}
          <Suspense fallback={null}>
            <PieceModal />
          </Suspense>
        </ProductModalProvider>
      </CartProvider>
    </CatalogProvider>
  );
}
