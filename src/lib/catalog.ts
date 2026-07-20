import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { PRODUCTS, Product } from './products';
import { hasDb, listProducts } from './db';

/** Cache tag covering every cached read of the product catalog. Expired via
 * `updateTag` in admin actions and `revalidateTag` in the Stripe webhook, so
 * a sale takes a piece off the public site immediately — the 5-minute
 * `revalidate` below is only a safety net against a missed invalidation. */
export const CATALOG_TAG = 'catalog';

const getCachedProducts = unstable_cache(() => listProducts(), [CATALOG_TAG], {
  tags: [CATALOG_TAG],
  revalidate: 300,
});

/**
 * The catalog the public site renders. Reads from the database when
 * DATABASE_URL is configured; otherwise falls back to the static placeholder
 * catalog in `products.ts` so the site works before any infrastructure is
 * set up. If the database is configured but unreachable we fail loudly
 * rather than render stale placeholder stock.
 *
 * Wrapped in React `cache` so the layout, the page, and `generateMetadata`
 * share a single read within one request; `getCachedProducts` adds the
 * cross-request, tag-invalidated cache on top of the database call.
 */
export const getCatalog = cache(async (): Promise<Product[]> => {
  if (!hasDb()) return PRODUCTS;
  return getCachedProducts();
});

/** A single piece by id. Derived from `getCatalog` so the per-piece metadata
 * and the Product JSON-LD always agree, and so it shares the same request and
 * catalog caches. */
export const getCatalogProduct = cache(async (id: string): Promise<Product | null> => {
  const all = await getCatalog();
  return all.find((p) => p.id === id) ?? null;
});
