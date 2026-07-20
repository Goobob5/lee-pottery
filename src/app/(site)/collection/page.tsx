import type { Metadata } from 'next';
import { getCatalog, getCatalogProduct } from '@/lib/catalog';
import { pieceImageUrl, pieceUrl, productJsonLd } from '@/lib/site';
import CollectionGrid from './CollectionGrid';

type Props = {
  searchParams: Promise<{ piece?: string | string[] }>;
};

function pieceIdOf(sp: { piece?: string | string[] }): string | null {
  const v = sp.piece;
  return (Array.isArray(v) ? v[0] : v) ?? null;
}

const COLLECTION_META: Metadata = {
  title: 'The collection',
  description: 'One-of-a-kind ceramics and small batches, thrown by hand in Sydney by Richard Lee.',
  alternates: { canonical: '/collection' },
};

// When the collection page is opened to a specific piece (`?piece=…`), the
// metadata describes that piece so a shared/pasted link unfurls as the piece —
// its photo, name and price — rather than a generic site card.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const id = pieceIdOf(await searchParams);
  if (!id) return COLLECTION_META;

  const p = await getCatalogProduct(id);
  if (!p) return COLLECTION_META;

  const image = pieceImageUrl(p);
  const priceLine = p.sold ? 'Sold' : `$${p.price} AUD`;
  const description = `${p.desc} — ${priceLine}.`;
  const ogTitle = `${p.name} — Lee Pottery`;

  return {
    title: p.name,
    description,
    alternates: { canonical: pieceUrl(p.id) },
    openGraph: {
      type: 'website',
      title: ogTitle,
      description,
      url: pieceUrl(p.id),
      siteName: 'Lee Pottery',
      images: image ? [{ url: image, alt: p.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CollectionRoute({ searchParams }: Props) {
  const [products, sp] = await Promise.all([getCatalog(), searchParams]);
  const id = pieceIdOf(sp);
  const piece = id ? products.find((p) => p.id === id) ?? null : null;

  return (
    <>
      {piece && (
        <script
          type="application/ld+json"
          // schema.org Product data so Google can index the piece with its price
          // and availability. Regenerated per request from live catalog data.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(piece)) }}
        />
      )}
      <CollectionGrid />
    </>
  );
}
