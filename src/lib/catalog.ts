import { PRODUCTS, Product } from './products';
import { hasDb, listProducts } from './db';

/**
 * The catalog the public site renders. Reads from the database when
 * DATABASE_URL is configured; otherwise falls back to the static placeholder
 * catalog in `products.ts` so the site works before any infrastructure is
 * set up. If the database is configured but unreachable we fail loudly
 * rather than render stale placeholder stock.
 */
export async function getCatalog(): Promise<Product[]> {
  if (!hasDb()) return PRODUCTS;
  return listProducts();
}
