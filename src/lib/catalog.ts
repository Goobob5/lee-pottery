import { cache } from 'react';
import { PRODUCTS, Product } from './products';
import { getProductById, hasDb, listProducts } from './db';

/**
 * The catalog the public site renders. Reads from the database when
 * DATABASE_URL is configured; otherwise falls back to the static placeholder
 * catalog in `products.ts` so the site works before any infrastructure is
 * set up. If the database is configured but unreachable we fail loudly
 * rather than render stale placeholder stock.
 *
 * Wrapped in React `cache` so the layout, the page, and `generateMetadata`
 * share a single database read within one request instead of querying thrice.
 */
export const getCatalog = cache(async (): Promise<Product[]> => {
  if (!hasDb()) return PRODUCTS;
  return listProducts();
});

/** A single piece by id, with the same database/placeholder fallback as
 * `getCatalog`. Used by the per-piece metadata on the collection route. */
export const getCatalogProduct = cache(async (id: string): Promise<Product | null> => {
  if (!hasDb()) return PRODUCTS.find((p) => p.id === id) ?? null;
  return getProductById(id);
});
