import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

/**
 * Issues short-lived client-upload tokens for Vercel Blob. Raw phone photos are
 * 5–15 MB and Vercel's serverless request body limit is ~4.5 MB, so the browser
 * uploads straight to Blob using `upload()` from `@vercel/blob/client`; this
 * route only mints the credential for that upload.
 *
 * It mints upload credentials, so it MUST be admin-gated: the session cookie is
 * checked before any token is generated.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
        // Raw pro-mode frames from a Galaxy S24+ top out well under this.
        maximumSizeInBytes: 30 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      // Nothing to persist here — the client hands the raw URLs to
      // /api/process-piece, which is where the durable work happens.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 400 },
    );
  }
}
