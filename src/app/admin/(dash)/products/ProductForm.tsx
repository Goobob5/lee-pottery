import Link from 'next/link';
import { FILTER_TYPES } from '@/lib/products';
import type { AdminProduct } from '@/lib/db';
import type { ListingDraft } from '@/lib/listing';
import { deleteProductAction, saveProductAction } from '@/lib/admin-actions';
import ConfirmButton from '../../ConfirmButton';
import PhotoStrip from './PhotoStrip';
import styles from '../../admin.module.css';

const TYPES = FILTER_TYPES.filter((t) => t !== 'All');

type ProductFormProps = {
  piece?: AdminProduct;
  /** AI-drafted starting values when adding a piece via the listing pipeline. */
  draft?: Partial<ListingDraft>;
  /** Processed photo URLs to review/reorder; replaces the manual path fields. */
  photos?: string[];
  /** Index of the photo the drafter picked as hero. */
  heroIndex?: number;
  /** Default for the "one of a kind" checkbox (from the piece's kind). */
  defaultOneOfAKind?: boolean;
  /** Prefill from `piece` but save as a NEW piece (Duplicate/relist flow):
   * no hidden id (a fresh slug is derived), name suffixed "(copy)", stock reset. */
  duplicate?: boolean;
};

/** Shared create/edit form. Server-rendered on purpose — plain HTML forms
 * posting to server actions work on a flaky market-day connection. Also used
 * as the listing-pipeline review screen: pass `draft` + `photos` to prefill
 * from the AI and swap the manual photo-path fields for a reorderable strip.
 * Pass `duplicate` with a `piece` to relist a copy: same prefill, but saved as
 * a new piece via the unchanged `saveProductAction`, never touching the original. */
export default function ProductForm({ piece, draft, photos, heroIndex = 0, defaultOneOfAKind, duplicate }: ProductFormProps) {
  // When duplicating we prefill from `piece` but are NOT editing it — omitting
  // the hidden id makes saveProductAction derive a new slug from the name.
  const editing = !!piece && !duplicate;
  const reviewing = !!photos;
  const oneOfAKindDefault = piece?.oneOfAKind ?? defaultOneOfAKind ?? true;
  const nameDefault = duplicate && piece ? `${piece.name} (copy)` : (piece?.name ?? draft?.name);
  // "everything except stock" — a copy starts at the base default, not the source count.
  const stockDefault = duplicate ? 1 : (piece?.stock ?? 1);

  return (
    <>
      <form action={saveProductAction} className={`${styles.card} ${styles.form}`}>
        {editing && <input type="hidden" name="id" value={piece.id} />}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">Name</label>
          <input id="name" name="name" className={styles.input} defaultValue={nameDefault} required />
          {!editing && <span className={styles.hint}>The web address is made from the name automatically.</span>}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="type">Type</label>
            <select id="type" name="type" className={styles.select} defaultValue={piece?.type ?? draft?.type ?? 'Bowls'}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="price">Price (AUD)</label>
            <input
              id="price" name="price" type="number" min="0" step="1" inputMode="numeric"
              className={styles.input} defaultValue={piece?.price} required
            />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <span className={styles.label}>Kind</span>
            <label className={styles.checkRow}>
              <input type="checkbox" name="oneOfAKind" defaultChecked={oneOfAKindDefault} />
              One of a kind
            </label>
            <span className={styles.hint}>Untick for batch pieces (mugs, sets) and set the stock count.</span>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="stock">Stock</label>
            <input
              id="stock" name="stock" type="number" min="0" step="1" inputMode="numeric"
              className={styles.input} defaultValue={stockDefault} required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="batch">Batch label</label>
          <input
            id="batch" name="batch" className={styles.input} defaultValue={piece?.batch ?? ''}
            placeholder="e.g. Small batch of six"
          />
          <span className={styles.hint}>Shown instead of “One of a kind” on batch pieces. Leave empty for one-offs.</span>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="dims">Size</label>
            <input id="dims" name="dims" className={styles.input} defaultValue={piece?.dims ?? draft?.dims} placeholder="e.g. 21 cm across, 9 cm deep" />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="material">Clay & glaze</label>
            <input id="material" name="material" className={styles.input} defaultValue={piece?.material ?? draft?.material} placeholder="e.g. Speckled stoneware, cobalt brushwork" />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="meta">Card line</label>
          <input id="meta" name="meta" className={styles.input} defaultValue={piece?.meta ?? draft?.meta} placeholder="e.g. Speckled stoneware, unglazed rim · 21 cm" />
          <span className={styles.hint}>The short line under the name on collection cards.</span>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="desc">Description</label>
          <textarea id="desc" name="desc" className={styles.textarea} defaultValue={piece?.desc ?? draft?.desc} rows={3} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="note">Your note</label>
          <textarea id="note" name="note" className={styles.textarea} defaultValue={piece?.note ?? draft?.note} rows={3} />
          <span className={styles.hint}>The personal line signed “Richard” on the piece page — your voice, keep it yours.</span>
        </div>

        {reviewing ? (
          <PhotoStrip photos={photos} initialHero={heroIndex} />
        ) : (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="image">Main photo path</label>
              <input id="image" name="image" className={styles.input} defaultValue={piece?.image ?? ''} placeholder="/images/products/estuary-bowl.webp" />
              <span className={styles.hint}>
                Photos live in the site repo under <code>public/images/products/</code>, or upload straight from
                your phone at <code>/admin/new-piece</code>. Drop a file in and put its path here, or paste a URL.
              </span>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="photos">Extra photo paths</label>
              <textarea
                id="photos" name="photos" className={styles.textarea} rows={3}
                defaultValue={piece?.photos?.join('\n') ?? ''}
                placeholder={'/images/products/estuary-bowl-top.webp\n/images/products/estuary-bowl-detail.webp'}
              />
              <span className={styles.hint}>One per line, in display order — angles and details for the piece gallery.</span>
            </div>
          </>
        )}

        <div className={styles.formActions}>
          <button type="submit" className={styles.btn}>{editing ? 'Save changes' : reviewing ? 'Publish piece' : duplicate ? 'Add copy' : 'Add piece'}</button>
        </div>
      </form>

      {editing && (
        <>
          <Link
            href={`/admin/products/${piece.id}/duplicate`}
            className={`${styles.btn} ${styles.btnGhost}`}
            style={{ textDecoration: 'none' }}
          >
            Duplicate this piece
          </Link>

          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={piece.id} />
            <ConfirmButton
              message={`Delete “${piece.name}” for good? If it just sold, mark it sold instead so it shows as “found a home”.`}
              className={`${styles.btn} ${styles.btnDanger}`}
            >
              Delete this piece
            </ConfirmButton>
          </form>
        </>
      )}
    </>
  );
}
