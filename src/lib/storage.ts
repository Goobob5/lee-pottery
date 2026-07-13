import { put } from '@vercel/blob';
import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Where product photos live. On Vercel it's Vercel Blob (`BLOB_READ_WRITE_TOKEN`);
 * without a token we fall back to writing under `public/uploads/`, which keeps
 * the whole listing pipeline working in local development. Either way the value
 * stored in the database is a plain string the site can render:
 *
 *   - `https://…public.blob.vercel-storage.com/…` — a remote Blob URL
 *   - `/uploads/…` or `/images/…`                 — a local path under /public
 *
 * `next/image` handles both (the Blob host is allow-listed in next.config.ts).
 */

export function hasBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

const LOCAL_ROOT = path.join(process.cwd(), 'public', 'uploads');

/**
 * Store bytes under `key` and return a URL/path usable by the DB and next/image.
 * `key` is a relative path like `products/estuary-bowl/photo-1.webp`.
 */
export async function storeFile(key: string, data: Buffer, contentType: string): Promise<string> {
  const clean = key.replace(/^\/+/, '');
  if (hasBlob()) {
    const blob = await put(clean, data, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return blob.url;
  }
  const dest = path.join(LOCAL_ROOT, clean);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, data);
  return `/uploads/${clean}`;
}

/**
 * Read stored bytes back, whether the value is a remote URL (Blob/https) or a
 * local path under /public (`/uploads/…`, `/images/…`). Used by the processing
 * and drafting routes to fetch the raw uploads a phone just sent.
 */
export async function readFile(url: string): Promise<Buffer> {
  if (/^https?:\/\//.test(url)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not fetch ${url}: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  const rel = url.replace(/^\/+/, '');
  const local = path.join(process.cwd(), 'public', rel);
  // Guard against path traversal in the value we were handed.
  if (!local.startsWith(path.join(process.cwd(), 'public') + path.sep)) {
    throw new Error(`Refusing to read outside /public: ${url}`);
  }
  return fs.readFile(local);
}
