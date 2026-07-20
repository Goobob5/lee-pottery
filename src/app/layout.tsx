import type { Metadata } from 'next';
import { Kaushan_Script, Playfair_Display, Work_Sans } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
