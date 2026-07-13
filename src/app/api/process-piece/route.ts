import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { isAdmin } from '@/lib/admin-auth';
import { readFile, storeFile } from '@/lib/storage';

/**
 * Turns the raw phone uploads into clean, web-ready photos. Per photo:
 * auto-rotate from EXIF, gentle levels (`normalise`), resize to 2000 px on the
 * longest edge, and encode as WebP. The raws stay untouched in storage as the
 * backup for one-off pieces; this only writes the processed versions.
 *
 * White balance is left to `normalise()` + Richard's review for v1 — a
 * grey-card-accurate sampler is a Phase 3 stretch goal, not a blocker.
 */

// Route handlers default to the Node runtime; sharp needs it (not Edge).
export const runtime = 'nodejs';
export const maxDuration = 60;

type ProcessBody = { rawUrls?: unknown; pieceKey?: unknown };

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const body = (await request.json()) as ProcessBody;
  const rawUrls = Array.isArray(body.rawUrls) ? body.rawUrls.filter((u): u is string => typeof u === 'string') : [];
  if (rawUrls.length === 0) {
    return NextResponse.json({ error: 'No photos to process.' }, { status: 400 });
  }

  const pieceKey =
    (typeof body.pieceKey === 'string' && body.pieceKey.replace(/[^a-z0-9-]/gi, '').slice(0, 40)) ||
    `piece-${Date.now().toString(36)}`;

  try {
    const photos: string[] = [];
    for (let i = 0; i < rawUrls.length; i++) {
      const raw = await readFile(rawUrls[i]);
      const processed = await sharp(raw)
        .rotate() // honour EXIF orientation, then drop the tag
        .normalise() // stretch levels so whites read white and cobalt reads deep
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      const url = await storeFile(`products/${pieceKey}/photo-${i + 1}.webp`, processed, 'image/webp');
      photos.push(url);
    }
    return NextResponse.json({ photos, pieceKey });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not process the photos.' },
      { status: 500 },
    );
  }
}
