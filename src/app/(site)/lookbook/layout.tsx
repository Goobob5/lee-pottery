import type { Metadata } from 'next';

// The page itself is a client component and so cannot export metadata; this
// layout gives it a real title and description instead of the site defaults.
export const metadata: Metadata = {
  title: 'Lookbook — Lee Pottery',
  description:
    'The current range for gallerists, stockists and market holders — one-of-a-kind ceramics and small batches thrown by hand in Sydney.',
};

export default function LookbookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
