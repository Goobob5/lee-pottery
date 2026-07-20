import type { Product } from './products';

/**
 * The site's public base URL — used for absolute URLs in metadata, the sitemap,
 * Product JSON-LD, and shareable links. Prefers an explicit override, then
 * Vercel's deployment URLs, and finally the production domain. Never carries a
 * trailing slash.
 *
 * Note: only `NEXT_PUBLIC_SITE_URL` is readable in the browser; the `VERCEL_*`
 * vars are server-only, so on the client this falls back to the production
 * domain. Client code that needs the *current* origin (e.g. a copy-link button
 * on a preview deploy) should use `window.location.origin` with `piecePath()`.
 */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    'https://leepottery.com.au';
  return raw.replace(/\/+$/, '');
}

/**
 * The canonical path for a piece: the collection page with the piece open.
 * One-of-a-kind and batch pieces alike are reachable here; the URL outlives the
 * sale (a sold piece still resolves, shown as sold). Pure — no env access — so
 * it's safe to combine with `window.location.origin` on the client.
 */
export function piecePath(id: string): string {
  return `/collection?piece=${encodeURIComponent(id)}`;
}

/** The absolute canonical URL for a piece. */
export function pieceUrl(id: string): string {
  return `${siteUrl()}${piecePath(id)}`;
}

/**
 * Turns a stored image value into an absolute, publicly reachable URL (or null).
 * Remote Blob/https URLs pass through unchanged; repo-path and upload values
 * under `/public` are prefixed with the site's base URL so they work as
 * `og:image` and in the sitemap.
 */
export function absoluteMediaUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  return `${siteUrl()}/${src.replace(/^\/+/, '')}`;
}

/** The piece's hero photo as an absolute URL, or null if it has none yet. */
export function pieceImageUrl(p: Product): string | null {
  const hero = (p.photos && p.photos.length > 0 ? p.photos[0] : p.image) ?? null;
  return absoluteMediaUrl(hero);
}

/**
 * schema.org `Product` structured data for a piece, generated from live catalog
 * data. Availability flips to `SoldOut` when the piece sells, so a shared link
 * to a sold-out piece indexes honestly.
 */
export function productJsonLd(p: Product): Record<string, unknown> {
  const image = pieceImageUrl(p);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.desc,
    ...(image ? { image: [image] } : {}),
    ...(p.material ? { material: p.material } : {}),
    category: p.type,
    brand: { '@type': 'Brand', name: 'Lee Pottery' },
    offers: {
      '@type': 'Offer',
      url: pieceUrl(p.id),
      priceCurrency: 'AUD',
      price: p.price.toFixed(2),
      availability: p.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Lee Pottery' },
    },
  };
}
