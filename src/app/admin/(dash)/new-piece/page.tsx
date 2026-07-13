import Link from 'next/link';
import { hasDb } from '@/lib/db';
import { hasBlob } from '@/lib/storage';
import NewPieceFlow from './NewPieceFlow';
import styles from '../../admin.module.css';

/**
 * The phone-first listing pipeline: shoot → upload → auto-process → AI draft →
 * review → publish. Every stage fails closed with a visible banner, and the
 * flow still completes (photos attached, fields empty) if drafting is off.
 */
export default function NewPiecePage() {
  const db = hasDb();
  const blob = hasBlob();
  const ai = !!process.env.ANTHROPIC_API_KEY;

  if (!db) {
    return (
      <>
        <h1 className={styles.title}>Add a piece from your phone</h1>
        <div className={styles.banner}>
          <strong>No database connected.</strong> Publishing needs a database. Set <code>DATABASE_URL</code>{' '}
          (a free Neon Postgres works) and redeploy, then come back here.
        </div>
      </>
    );
  }

  return (
    <>
      {!blob && (
        <div className={styles.banner}>
          <strong>Uploads are saving locally.</strong> <code>BLOB_READ_WRITE_TOKEN</code> isn’t set, so photos
          are written into <code>public/uploads/</code> on this machine instead of Vercel Blob. Fine for local
          testing; set the token in Vercel so phone uploads are stored and served for real.
        </div>
      )}
      {!ai && (
        <div className={styles.banner}>
          <strong>AI drafting is off.</strong> <code>ANTHROPIC_API_KEY</code> isn’t set, so the photos are
          processed and attached but the listing fields come up empty for you to fill in. Set the key to have
          Claude draft them in your voice.
        </div>
      )}
      <NewPieceFlow blobEnabled={blob} aiEnabled={ai} />
      <p className={styles.hint} style={{ marginTop: 'var(--space-3)' }}>
        Prefer to type a listing by hand? <Link href="/admin/products/new">Add a piece the plain way</Link>.
      </p>
    </>
  );
}
