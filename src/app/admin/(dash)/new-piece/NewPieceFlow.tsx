'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import ProductForm from '../products/ProductForm';
import type { ListingDraft, PieceFacts } from '@/lib/listing';
import styles from '../../admin.module.css';

type Phase = 'form' | 'working' | 'review';

const STEPS = ['Uploading photos', 'Cleaning up the photos', 'Drafting the listing'] as const;

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function uploadRaw(file: File, blobEnabled: boolean): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const pathname = `raw/${isoDate()}/${crypto.randomUUID()}.${ext}`;
  if (blobEnabled) {
    const result = await upload(pathname, file, { access: 'public', handleUploadUrl: '/api/blob-upload' });
    return result.url;
  }
  const body = new FormData();
  body.set('file', file);
  const res = await fetch('/api/local-upload', { method: 'POST', body });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Upload failed.');
  return (await res.json()).url as string;
}

export default function NewPieceFlow({ blobEnabled, aiEnabled }: { blobEnabled: boolean; aiEnabled: boolean }) {
  const [phase, setPhase] = useState<Phase>('form');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [facts, setFacts] = useState<PieceFacts>({
    dims: '',
    weight: '',
    capacity: '',
    material: '',
    kind: 'one-off',
    story: '',
  });
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [draftWarning, setDraftWarning] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [draft, setDraft] = useState<Partial<ListingDraft> | undefined>(undefined);
  const [heroIndex, setHeroIndex] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  function onPick(list: FileList | null) {
    const picked = list ? Array.from(list) : [];
    setFiles(picked);
    setPreviews((old) => {
      old.forEach((url) => URL.revokeObjectURL(url));
      return picked.map((f) => URL.createObjectURL(f));
    });
  }

  const setFact = <K extends keyof PieceFacts>(key: K, value: PieceFacts[K]) =>
    setFacts((f) => ({ ...f, [key]: value }));

  async function run() {
    setError(null);
    setDraftWarning(null);
    if (files.length === 0) {
      setError('Add at least one photo.');
      return;
    }
    setPhase('working');
    try {
      // 1 — raw uploads
      setStep(0);
      const rawUrls: string[] = [];
      for (const file of files) rawUrls.push(await uploadRaw(file, blobEnabled));

      // 2 — processing
      setStep(1);
      const pieceKey = crypto.randomUUID().slice(0, 8);
      const procRes = await fetch('/api/process-piece', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rawUrls, pieceKey }),
      });
      if (!procRes.ok) throw new Error((await procRes.json().catch(() => ({}))).error || 'Could not process the photos.');
      const processed = (await procRes.json()).photos as string[];
      setPhotos(processed);

      // 3 — drafting (never fatal: a failed draft still lands on the form)
      setStep(2);
      if (aiEnabled) {
        const draftRes = await fetch('/api/draft-listing', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ photos: processed, facts }),
        });
        const data = await draftRes.json().catch(() => ({}));
        if (data?.draft) {
          setDraft(data.draft as ListingDraft);
          const hero = Number((data.draft as ListingDraft).suggestedHeroIndex);
          setHeroIndex(Number.isInteger(hero) && hero >= 0 && hero < processed.length ? hero : 0);
        } else {
          setDraftWarning(data?.error || 'The draft came back empty — fill the fields in yourself.');
        }
      } else {
        setDraft({ dims: facts.dims, material: facts.material });
      }
      setPhase('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setPhase('form');
    }
  }

  if (phase === 'review') {
    return (
      <>
        <h1 className={styles.title}>Review &amp; publish</h1>
        <p className={styles.subtitle}>
          Everything below is a draft. Edit anything, set the price, then publish — nothing goes live until you do.
        </p>
        {draftWarning && (
          <div className={styles.banner}>
            <strong>Draft unavailable.</strong> {draftWarning} The photos are attached and ready.
          </div>
        )}
        <ProductForm
          draft={draft}
          photos={photos}
          heroIndex={heroIndex}
          defaultOneOfAKind={facts.kind === 'one-off'}
        />
      </>
    );
  }

  if (phase === 'working') {
    return (
      <>
        <h1 className={styles.title}>Working on it…</h1>
        <ul className={styles.progress}>
          {STEPS.map((label, i) => (
            <li key={label} className={`${styles.progressStep} ${i < step ? styles.progressDone : ''} ${i === step ? styles.progressNow : ''}`}>
              <span className={styles.progressDot}>{i < step ? '✓' : i === step ? '…' : ''}</span>
              {label}
            </li>
          ))}
        </ul>
        <p className={styles.hint}>Keep this page open — big photos over a phone connection can take a moment.</p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.title}>Add a piece from your phone</h1>
      <p className={styles.subtitle}>
        Photograph the piece, add the measurements and a sentence about it, and get a drafted listing to review.
      </p>

      <div className={`${styles.card} ${styles.form}`}>
        <div className={styles.field}>
          <span className={styles.label}>Photos</span>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className={styles.input}
            onChange={(e) => onPick(e.target.files)}
          />
          <span className={styles.hint}>Straight from the camera roll — hero, front, top, detail, scale.</span>
          {previews.length > 0 && (
            <div className={styles.pickGrid}>
              {previews.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className={styles.pickThumb} />
              ))}
            </div>
          )}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="dims">Size</label>
            <input id="dims" className={styles.input} value={facts.dims} onChange={(e) => setFact('dims', e.target.value)} placeholder="e.g. 21 cm across, 9 cm deep" />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="weight">Weight</label>
            <input id="weight" className={styles.input} value={facts.weight} onChange={(e) => setFact('weight', e.target.value)} placeholder="e.g. 1.2 kg (for postage)" />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="capacity">Capacity</label>
            <input id="capacity" className={styles.input} value={facts.capacity} onChange={(e) => setFact('capacity', e.target.value)} placeholder="e.g. 350 ml (mugs, jugs)" />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="kind">Kind</label>
            <select id="kind" className={styles.select} value={facts.kind} onChange={(e) => setFact('kind', e.target.value as PieceFacts['kind'])}>
              <option value="one-off">One of a kind</option>
              <option value="batch">Batch</option>
              <option value="repeatable">Repeatable</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="material">Clay &amp; glaze</label>
          <input id="material" className={styles.input} value={facts.material} onChange={(e) => setFact('material', e.target.value)} placeholder="e.g. Speckled stoneware, cobalt brushwork" />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="story">One sentence about it</label>
          <textarea id="story" className={styles.textarea} rows={3} value={facts.story} onChange={(e) => setFact('story', e.target.value)} placeholder="Where the drawing came from, what the glaze did — dictate it with the keyboard mic if that&rsquo;s easier." />
          <span className={styles.hint}>This feeds the description and your signed note. You&rsquo;ll review both before publishing.</span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.formActions}>
          <button type="button" className={styles.btn} onClick={run} disabled={files.length === 0}>
            {aiEnabled ? 'Create draft' : 'Process photos'}
          </button>
        </div>
      </div>
    </>
  );
}
