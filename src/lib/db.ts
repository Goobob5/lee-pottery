import postgres from 'postgres';
import { PRODUCTS, Product } from './products';

/**
 * Server-only database layer. Backed by any Postgres (Neon's pooled
 * connection string on Vercel, a local Postgres in development).
 *
 * The schema is created and seeded automatically on first use, so setup is
 * just "set DATABASE_URL and deploy". When DATABASE_URL isn't set, callers
 * fall back to the static placeholder catalog — see `catalog.ts`.
 */

export function hasDb(): boolean {
  return !!process.env.DATABASE_URL;
}

let client: postgres.Sql | null = null;
let schemaReady: Promise<void> | null = null;

/** Minutes a one-of-a-kind piece is held once a buyer starts checkout.
 * Slightly longer than the Stripe session so the hold can't lapse first. */
export const RESERVATION_MINUTES = 35;
export const CHECKOUT_SESSION_MINUTES = 31;

export async function db(): Promise<postgres.Sql> {
  if (!client) {
    client = postgres(process.env.DATABASE_URL!, {
      // One connection per serverless instance; Neon's pooler handles fan-out.
      max: 1,
      connect_timeout: 10,
    });
  }
  if (!schemaReady) {
    schemaReady = ensureSchema(client).catch((e) => {
      schemaReady = null;
      throw e;
    });
  }
  await schemaReady;
  return client;
}

async function ensureSchema(sql: postgres.Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id text PRIMARY KEY,
      name text NOT NULL,
      type text NOT NULL,
      price_cents integer NOT NULL,
      one_of_a_kind boolean NOT NULL DEFAULT false,
      batch text,
      stock integer NOT NULL DEFAULT 1,
      reserved_until timestamptz,
      image text,
      photos jsonb NOT NULL DEFAULT '[]',
      meta text NOT NULL DEFAULT '',
      dims text NOT NULL DEFAULT '',
      material text NOT NULL DEFAULT '',
      description text NOT NULL DEFAULT '',
      note text NOT NULL DEFAULT '',
      sold_at timestamptz,
      sold_channel text,
      sort integer,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id serial PRIMARY KEY,
      stripe_session_id text UNIQUE NOT NULL,
      email text,
      customer_name text,
      amount_total_cents integer,
      product_ids jsonb NOT NULL DEFAULT '[]',
      shipping jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM products`;
  if (count === 0) {
    for (const [i, p] of PRODUCTS.entries()) {
      await sql`
        INSERT INTO products ${sql({
          id: p.id,
          name: p.name,
          type: p.type,
          price_cents: Math.round(p.price * 100),
          one_of_a_kind: p.oneOfAKind,
          batch: p.batch ?? null,
          stock: p.sold ? 0 : p.stock ?? 1,
          image: p.image,
          photos: sql.json(p.photos ?? []),
          meta: p.meta,
          dims: p.dims,
          material: p.material,
          description: p.desc,
          note: p.note,
          sold_at: p.sold ? new Date() : null,
          sold_channel: p.sold ? 'in-person' : null,
          sort: i,
        })}
        ON CONFLICT (id) DO NOTHING`;
    }
  }
}

type ProductRow = {
  id: string;
  name: string;
  type: string;
  price_cents: number;
  one_of_a_kind: boolean;
  batch: string | null;
  stock: number;
  reserved_until: Date | null;
  image: string | null;
  photos: string[];
  meta: string;
  dims: string;
  material: string;
  description: string;
  note: string;
  sold_at: Date | null;
  sold_channel: string | null;
};

/** A catalog product plus the operational fields the admin screens need. */
export type AdminProduct = Product & {
  stock: number;
  reservedUntil: string | null;
  soldAt: string | null;
  soldChannel: string | null;
};

function rowToProduct(r: ProductRow): AdminProduct {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    price: r.price_cents / 100,
    oneOfAKind: r.one_of_a_kind,
    batch: r.batch ?? undefined,
    sold: r.stock <= 0,
    stock: r.stock,
    image: r.image,
    photos: r.photos?.length ? r.photos : undefined,
    meta: r.meta,
    dims: r.dims,
    material: r.material,
    desc: r.description,
    note: r.note,
    reservedUntil: r.reserved_until ? r.reserved_until.toISOString() : null,
    soldAt: r.sold_at ? r.sold_at.toISOString() : null,
    soldChannel: r.sold_channel,
  };
}

export async function listProducts(): Promise<AdminProduct[]> {
  const sql = await db();
  const rows = await sql<ProductRow[]>`
    SELECT * FROM products ORDER BY sort NULLS LAST, created_at DESC`;
  return rows.map(rowToProduct);
}

export async function getProductById(id: string): Promise<AdminProduct | null> {
  const sql = await db();
  const rows = await sql<ProductRow[]>`SELECT * FROM products WHERE id = ${id}`;
  return rows.length ? rowToProduct(rows[0]) : null;
}

export type CheckoutHold =
  | { ok: true; items: AdminProduct[] }
  | { ok: false; unavailable: string[] };

/**
 * Atomically checks availability for a cart and places a time-limited hold
 * on the one-of-a-kind pieces so two buyers can't both pay for the same
 * piece. Batch pieces aren't held — stock is re-checked when the sale lands.
 */
export async function holdForCheckout(ids: string[]): Promise<CheckoutHold> {
  const sql = await db();
  return sql.begin(async (tx) => {
    const rows = await tx<ProductRow[]>`
      SELECT * FROM products WHERE id IN ${tx(ids)} FOR UPDATE`;
    const now = Date.now();
    const available = rows.filter(
      (r) =>
        r.stock > 0 &&
        !(r.one_of_a_kind && r.reserved_until && r.reserved_until.getTime() > now),
    );
    if (available.length !== rows.length || rows.length === 0) {
      const availableIds = new Set(available.map((r) => r.id));
      return {
        ok: false as const,
        unavailable: rows.filter((r) => !availableIds.has(r.id)).map((r) => r.name),
      };
    }
    const oneOffIds = available.filter((r) => r.one_of_a_kind).map((r) => r.id);
    if (oneOffIds.length) {
      await tx`
        UPDATE products
        SET reserved_until = now() + make_interval(mins => ${RESERVATION_MINUTES})
        WHERE id IN ${tx(oneOffIds)}`;
    }
    return { ok: true as const, items: available.map(rowToProduct) };
  });
}

/** Lets held pieces go again (Stripe checkout expired or was abandoned). */
export async function releaseHolds(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const sql = await db();
  await sql`
    UPDATE products SET reserved_until = NULL, updated_at = now()
    WHERE id IN ${sql(ids)}`;
}

/**
 * Records a sale: one unit off each piece, holds cleared, and the piece
 * stamped with when/where it sold once the last unit goes.
 */
export async function recordSale(ids: string[], channel: 'online' | 'in-person'): Promise<void> {
  if (!ids.length) return;
  const sql = await db();
  await sql`
    UPDATE products
    SET stock = GREATEST(stock - 1, 0),
        reserved_until = NULL,
        sold_at = CASE WHEN stock - 1 <= 0 THEN now() ELSE sold_at END,
        sold_channel = CASE WHEN stock - 1 <= 0 THEN ${channel} ELSE sold_channel END,
        updated_at = now()
    WHERE id IN ${sql(ids)}`;
}

/** Admin stock correction: put a piece back on the shelf or adjust a batch. */
export async function setStock(id: string, stock: number): Promise<void> {
  const sql = await db();
  await sql`
    UPDATE products
    SET stock = ${Math.max(0, stock)},
        reserved_until = NULL,
        sold_at = CASE WHEN ${stock} > 0 THEN NULL ELSE sold_at END,
        sold_channel = CASE WHEN ${stock} > 0 THEN NULL ELSE sold_channel END,
        updated_at = now()
    WHERE id = ${id}`;
}

export type ProductInput = {
  id: string;
  name: string;
  type: string;
  price: number;
  oneOfAKind: boolean;
  batch: string | null;
  stock: number;
  image: string | null;
  photos: string[];
  meta: string;
  dims: string;
  material: string;
  desc: string;
  note: string;
};

export async function upsertProduct(p: ProductInput): Promise<void> {
  const sql = await db();
  const record = {
    id: p.id,
    name: p.name,
    type: p.type,
    price_cents: Math.round(p.price * 100),
    one_of_a_kind: p.oneOfAKind,
    batch: p.batch,
    stock: Math.max(0, p.stock),
    image: p.image,
    photos: sql.json(p.photos),
    meta: p.meta,
    dims: p.dims,
    material: p.material,
    description: p.desc,
    note: p.note,
    updated_at: new Date(),
  };
  await sql`
    INSERT INTO products ${sql(record)}
    ON CONFLICT (id) DO UPDATE SET ${sql(record)}`;
}

export async function deleteProduct(id: string): Promise<void> {
  const sql = await db();
  await sql`DELETE FROM products WHERE id = ${id}`;
}

export type OrderInput = {
  stripeSessionId: string;
  email: string | null;
  customerName: string | null;
  amountTotalCents: number | null;
  productIds: string[];
  shipping: unknown;
};

export type OrderRecord = {
  id: number;
  stripe_session_id: string;
  email: string | null;
  customer_name: string | null;
  amount_total_cents: number | null;
  product_ids: string[];
  shipping: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string } | null;
  created_at: Date;
};

/** Returns false if this Stripe session was already recorded (webhook retry). */
export async function insertOrder(o: OrderInput): Promise<boolean> {
  const sql = await db();
  const rows = await sql`
    INSERT INTO orders ${sql({
      stripe_session_id: o.stripeSessionId,
      email: o.email,
      customer_name: o.customerName,
      amount_total_cents: o.amountTotalCents,
      product_ids: sql.json(o.productIds),
      shipping: o.shipping == null ? null : sql.json(o.shipping as never),
    })}
    ON CONFLICT (stripe_session_id) DO NOTHING
    RETURNING id`;
  return rows.length > 0;
}

export async function listOrders(): Promise<OrderRecord[]> {
  const sql = await db();
  return sql<OrderRecord[]>`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`;
}
