import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { hasBlob, storeFile } from '@/lib/storage';

/**
 * Local-development fallback for raw photo uploads. When Vercel Blob isn't
 * configured, the browser can't upload directly to it, so it POSTs each raw
 * file here and this route writes it under `public/uploads/raw/…`. Only used
 * without `BLOB_READ_WRITE_TOKEN`; in production the phone uploads straight to
 * Blob via /api/blob-upload (this route refuses, so nothing large is ever
 * pushed through the ~4.5 MB serverless body limit).
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }
  if (hasBlob()) {
    return NextResponse.json(
      { error: 'Blob is configured — upload directly with /api/blob-upload.' },
      { status: 400 },
    );
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file.' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const date = new Date().toISOString().slice(0, 10);
  const key = `raw/${date}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await storeFile(key, buffer, file.type || 'image/jpeg');

  return NextResponse.json({ url });
}
