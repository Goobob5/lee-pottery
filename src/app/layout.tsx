import type { Metadata } from 'next';
import { Kaushan_Script, Playfair_Display, Work_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { ProductModalProvider } from '@/lib/product-modal-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PieceModal from '@/components/PieceModal';

const kaushan = Kaushan_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-kaushan',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-playfair',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-work-sans',
});

export const metadata: Metadata = {
  title: 'Lee Pottery — from my hands, to your home',
  description:
    'Sculpture and tableware thrown by hand in Sydney. One-of-a-kind ceramics and small batches by Richard Lee.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${kaushan.variable} ${playfair.variable} ${workSans.variable}`}>
      <body>
        <CartProvider>
          <ProductModalProvider>
            <Header />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
            <Footer />
            <PieceModal />
          </ProductModalProvider>
        </CartProvider>
      </body>
    </html>
  );
}
