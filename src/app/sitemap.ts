import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog';
import { pieceImageUrl, pieceUrl, siteUrl } from '@/lib/site';

// The catalog is dynamic (stock changes as pieces sell), so the sitemap is
// generated per request rather than cached — sold-out pieces drop out and new
// listings appear the moment they're published.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getCatalog();

  const pages: MetadataRoute.Sitemap = ['', '/collection', '/artist', '/lookbook'].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  // Every piece that's still for sale gets its own entry, with the hero photo as
  // an image-sitemap hint so Google can surface the piece in image search too.
  const pieces: MetadataRoute.Sitemap = products
    .filter((p) => !p.sold)
    .map((p) => {
      const image = pieceImageUrl(p);
      return {
        url: pieceUrl(p.id),
        changeFrequency: 'weekly',
        priority: 0.8,
        ...(image ? { images: [image] } : {}),
      };
    });

  return [...pages, ...pieces];
}
