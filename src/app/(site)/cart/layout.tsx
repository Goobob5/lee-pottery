import type { Metadata } from 'next';

// The page itself is a client component and so cannot export metadata; this
// layout gives the cart a real title, and keeps it out of search results.
export const metadata: Metadata = {
  title: 'Your cart — Lee Pottery',
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
