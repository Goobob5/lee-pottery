'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  adminConfigured,
  checkPassword,
  clearSessionCookie,
  requireAdmin,
  setSessionCookie,
} from './admin-auth';
import {
  deleteProduct,
  getProductById,
  hasDb,
  recordSale,
  setStock,
  upsertProduct,
  type ProductInput,
} from './db';

export type LoginState = { error: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminConfigured()) {
    return { error: 'ADMIN_PASSWORD is not set — add it to your environment to enable the admin.' };
  }
  const password = String(formData.get('password') ?? '');
  if (!checkPassword(password)) {
    return { error: 'Wrong password.' };
  }
  await setSessionCookie();
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect('/admin/login');
}

/** Everything below mutates the catalog, so the whole site cache is refreshed. */
function refreshSite() {
  revalidatePath('/', 'layout');
}

function requireDb() {
  if (!hasDb()) {
    throw new Error('DATABASE_URL is not set — connect a database to manage stock.');
  }
}

export async function markSoldInPersonAction(formData: FormData): Promise<void> {
  await requireAdmin();
  requireDb();
  const id = String(formData.get('id') ?? '');
  if (id) await recordSale([id], 'in-person');
  refreshSite();
}

export async function changeStockAction(formData: FormData): Promise<void> {
  await requireAdmin();
  requireDb();
  const id = String(formData.get('id') ?? '');
  const delta = Number(formData.get('delta') ?? 0);
  if (!id || !Number.isInteger(delta)) return;
  const product = await getProductById(id);
  if (!product) return;
  await setStock(id, product.stock + delta);
  refreshSite();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function saveProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  requireDb();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('A piece needs a name.');
  const id = String(formData.get('id') ?? '').trim() || slugify(name);
  if (!id) throw new Error('Could not derive an id from that name.');

  const price = Number(formData.get('price'));
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be a positive number.');

  const photos = String(formData.get('photos') ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const input: ProductInput = {
    id,
    name,
    type: String(formData.get('type') ?? 'Bowls'),
    price,
    oneOfAKind: formData.get('oneOfAKind') === 'on',
    batch: String(formData.get('batch') ?? '').trim() || null,
    stock: Math.max(0, Math.floor(Number(formData.get('stock')) || 0)),
    image: String(formData.get('image') ?? '').trim() || null,
    photos,
    meta: String(formData.get('meta') ?? '').trim(),
    dims: String(formData.get('dims') ?? '').trim(),
    material: String(formData.get('material') ?? '').trim(),
    desc: String(formData.get('desc') ?? '').trim(),
    note: String(formData.get('note') ?? '').trim(),
  };
  await upsertProduct(input);
  refreshSite();
  redirect('/admin');
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  requireDb();
  const id = String(formData.get('id') ?? '');
  if (id) await deleteProduct(id);
  refreshSite();
  redirect('/admin');
}
