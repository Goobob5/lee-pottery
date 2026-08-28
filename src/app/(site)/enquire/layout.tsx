import type { Metadata } from 'next';

// The page itself is a client component and so cannot export metadata; this
// layout gives it a real title and description instead of the site defaults.
export const metadata: Metadata = {
  title: 'Commissions & enquiries — Lee Pottery',
  description:
    'Commission a piece, stock the range, or ask about a work — start a conversation with Richard Lee.',
};

export default function EnquireLayout({ children }: { children: React.ReactNode }) {
  return children;
}
