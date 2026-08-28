import type { Metadata } from 'next';
import { Kaushan_Script, Playfair_Display, Work_Sans } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { siteUrl } from '@/lib/site';

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

/** Site-wide share card, resolved against `metadataBase`. */
const OG_IMAGE = '/images/og/lee-pottery.webp';

export const metadata: Metadata = {
  // Lets per-page metadata use relative URLs (canonical, og:image) that resolve
  // against the site's real origin. Per-piece pages override these fields.
  metadataBase: new URL(siteUrl()),
  title: 'Lee Pottery — from my hands, to your home',
  description:
    'Sculpture and tableware thrown by hand in Sydney. One-of-a-kind ceramics and small batches by Richard Lee.',
  openGraph: {
    type: 'website',
    siteName: 'Lee Pottery',
    locale: 'en_AU',
    title: 'Lee Pottery — from my hands, to your home',
    description:
      'Sculpture and tableware thrown by hand in Sydney. One-of-a-kind ceramics and small batches by Richard Lee.',
    // The site-wide share card. Without it, the bare domain — the link on a
    // market card or handed round in a message — unfurls as text only. Piece
    // pages override this with their own photo.
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'A Lee Pottery swan platter, cobalt on speckled stoneware' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lee Pottery — from my hands, to your home',
    description:
      'Sculpture and tableware thrown by hand in Sydney. One-of-a-kind ceramics and small batches by Richard Lee.',
    images: [OG_IMAGE],
  },
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
