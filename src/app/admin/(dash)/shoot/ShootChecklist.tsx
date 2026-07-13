'use client';

import { useEffect, useState } from 'react';
import styles from './Shoot.module.css';

/**
 * Photoshoot day — interactive SOP.
 *
 * The end-to-end listing process: prep the night before, rig the lightbox
 * once, then a repeatable per-piece loop (shots + facts while the piece is
 * in your hands), then publish each piece straight from the phone at
 * /admin/new-piece. Progress persists in localStorage so it survives the
 * phone locking between pieces.
 */

type Step = { id: string; label: string; tip?: string };

const PREP: Step[] = [
  {
    id: 'prep-phone',
    label: 'Charge the phone, clear 5+ GB of space',
    tip: 'Pro-mode photos are big, and a battery warning mid-shoot ruins the rhythm.',
  },
  {
    id: 'prep-pieces',
    label: 'Line up the pieces and wipe them down',
    tip: 'Group similar shapes and glazes together so you rarely re-rig. Fingerprints love glaze — wipe every piece now, not under the lights.',
  },
  {
    id: 'prep-sweep',
    label: 'Check the sweep is clean and uncreased',
    tip: 'The curved white poster board is the background of every shot; a wrinkle reads as a scratch in all of them. Replace it when it looks tired — it costs a few dollars.',
  },
  {
    id: 'prep-lights',
    label: 'Test both LED strips, rig diffusion if needed',
    tip: 'Both on, same brightness. Shooting glossy glazes? Tape baking paper over the strips — it kills the hard white streaks in reflections.',
  },
  {
    id: 'prep-kit',
    label: 'Kit check: tripod · grey card · white foam board · turntable · tape measure · kitchen scale · sticky notes + marker',
    tip: 'The foam board sits opposite the lights as a fill reflector. The scale is for shipping weights — measure once, never guess postage again.',
  },
];

const SETUP: Step[] = [
  {
    id: 'setup-daylight',
    label: 'Block the daylight',
    tip: 'Mixed light sources = mixed colour that no edit fully fixes. Blinds closed; the LED strips are the only light.',
  },
  {
    id: 'setup-tripod',
    label: 'Rig the tripod: piece height, 1–1.5 m back, 3× zoom',
    tip: 'The S24+ wide lens distorts vessel profiles up close — step back and use the 3× telephoto instead. Tape the tripod feet so the framing survives the session.',
  },
  {
    id: 'setup-promode',
    label: 'Dial in Pro mode: ISO 100 · white balance locked · grid on · 2-second timer',
    tip: 'Auto white balance drifts between shots and your cobalt stops matching itself. Lock it. The 2-second timer means tapping the shutter can’t shake the phone.',
  },
  {
    id: 'setup-greycard',
    label: 'Shoot one frame of the grey card',
    tip: 'This frame is the colour reference the whole shoot is corrected against. Ten seconds now, honest cobalt later. Don’t skip it.',
  },
  {
    id: 'setup-test',
    label: 'Test shot on a pale glazed piece, then adjust',
    tip: 'Zoom in and check: focus sharp, whites not blown out, no harsh streak reflections in the glaze. Move lights or add diffusion until it’s clean — every piece after this inherits the setup.',
  },
];

const PER_PIECE: Step[] = [
  {
    id: 'pp-slate',
    label: 'Slate frame: sticky note with the piece’s working name',
    tip: 'Shoot the sticky note first. Every photo until the next slate belongs to this piece — the shoot organises itself and nothing gets misfiled later.',
  },
  { id: 'pp-front', label: 'Shot 1 — front, straight on' },
  {
    id: 'pp-quarter',
    label: 'Shot 2 — three-quarter angle',
    tip: 'Turn the turntable about 30°. This is usually the hero shot that leads the listing.',
  },
  {
    id: 'pp-top',
    label: 'Shot 3 — top-down',
    tip: 'For bowls and platters this is the shot: the well and the brushwork. Raise the tripod or hand-hold with the timer.',
  },
  {
    id: 'pp-detail',
    label: 'Shot 4 — detail of the brushwork or glaze',
    tip: 'Close in on whatever makes this piece this piece — the swan, the drip, the pooling.',
  },
  {
    id: 'pp-scale',
    label: 'Shot 5 — scale shot, in hand or with a prop',
    tip: 'Online buyers can’t feel size, and “bigger than I thought” is the classic ceramics return. This shot prevents it.',
  },
  {
    id: 'pp-group',
    label: 'Batch pieces only — one group shot',
    tip: 'Shoot the batch together once, then the full shot list on one representative piece. Batch listings sell off one great set of photos.',
  },
  {
    id: 'pp-review',
    label: 'Review every shot before moving the piece',
    tip: 'Zoom in: focus, blown highlights, stray reflections. A reshoot now costs one minute; a reshoot tomorrow costs the whole setup.',
  },
  {
    id: 'pp-measure',
    label: 'Measure and weigh: height + width (cm), capacity (ml), weight (g)',
    tip: 'The weight is for postage quotes. Say it all into a voice note or type it — while the piece is still in front of you.',
  },
  {
    id: 'pp-story',
    label: 'Capture the story: clay, glaze, and one honest sentence',
    tip: 'A sentence or two while it’s in your hand — where the drawing came from, what the glaze did. This becomes the description and your signed note; future-you writes nothing from scratch.',
  },
];

const WRAP: Step[] = [
  {
    id: 'wrap-cull',
    label: 'Cull to the best ~6 per piece, right in the camera roll',
    tip: 'Hero, front, top, detail, scale (+ group for batches). Delete the rest now — “I’ll cull later” is how 400 photos never become listings. No computer needed.',
  },
  {
    id: 'wrap-publish',
    label: 'Publish each piece at “Add a piece” — straight from the phone',
    tip: 'Open Add a piece, upload that piece’s photos, type the measurements and your one sentence. It crops, levels and resizes the photos and drafts the listing in your voice — you review, set the price, and publish. No transfer, no GIMP, no repo.',
  },
  {
    id: 'wrap-check',
    label: 'Check the live site on your phone',
    tip: 'Thumbnails, prices, sold badges — thirty seconds as a customer.',
  },
  {
    id: 'wrap-backup',
    label: 'Back up the raw photos',
    tip: 'The pipeline keeps the raws, but one-offs can’t be reshot after they sell. Google Photos, a drive — a second copy anywhere that isn’t only the phone.',
  },
];

type SavedState = {
  startedAt: string;
  checked: string[];
  pieceChecked: string[];
  pieceName: string;
  piecesDone: string[];
};

const STORAGE_KEY = 'lp-shoot-day-v1';

function freshState(): SavedState {
  return { startedAt: new Date().toISOString(), checked: [], pieceChecked: [], pieceName: '', piecesDone: [] };
}

export default function ShootChecklist() {
  const [state, setState] = useState<SavedState>(freshState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && Array.isArray(saved.checked)) {
        setState(saved);
      }
    } catch {
      /* corrupt storage — start a fresh day */
    }
    setHydrated(true);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — checklist just won't persist */
    }
  }, [state, hydrated]);

  const isChecked = (id: string) => state.checked.includes(id) || state.pieceChecked.includes(id);

  function toggle(step: Step, loop: boolean) {
    setState((s) => {
      const key = loop ? 'pieceChecked' : 'checked';
      const list = s[key];
      return { ...s, [key]: list.includes(step.id) ? list.filter((x) => x !== step.id) : [...list, step.id] };
    });
  }

  function finishPiece() {
    setState((s) => ({
      ...s,
      piecesDone: [...s.piecesDone, s.pieceName.trim() || `Piece ${s.piecesDone.length + 1}`],
      pieceChecked: [],
      pieceName: '',
    }));
  }

  function resetDay() {
    if (window.confirm('Start a new shoot day? This clears all ticks and the finished-pieces list.')) {
      setState(freshState());
    }
  }

  const pieceRequired = PER_PIECE.filter((s) => s.id !== 'pp-group');
  const pieceReady = pieceRequired.every((s) => state.pieceChecked.includes(s.id));
  const doneCount = (steps: Step[], loop = false) =>
    steps.filter((s) => (loop ? state.pieceChecked : state.checked).includes(s.id)).length;

  const section = (title: string, blurb: string, steps: Step[], loop = false) => (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.sectionCount}>
          {doneCount(steps, loop)}/{steps.length}
        </span>
      </div>
      <p className={styles.sectionBlurb}>{blurb}</p>
      <ul className={styles.steps}>
        {steps.map((step) => (
          <li key={step.id}>
            <label className={`${styles.step} ${isChecked(step.id) ? styles.stepDone : ''}`}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={isChecked(step.id)}
                onChange={() => toggle(step, loop)}
              />
              <span className={styles.stepText}>
                <span className={styles.stepLabel}>{step.label}</span>
                {step.tip && <span className={styles.stepTip}>{step.tip}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );

  const startedLabel = new Date(state.startedAt).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Photoshoot day</h1>
          <p className={styles.subtitle}>
            Started {startedLabel} · {state.piecesDone.length} {state.piecesDone.length === 1 ? 'piece' : 'pieces'} shot
          </p>
        </div>
        <button className={styles.resetBtn} onClick={resetDay}>Start a new day</button>
      </div>

      {section(
        '1 · The night before',
        'Twenty minutes tonight buys a smooth morning. Everything here can happen with the kettle on.',
        PREP,
      )}

      {section(
        '2 · Rig the lightbox (once)',
        'Set the stage once and don’t touch it again — consistency across the whole shoot is what makes the collection page look professional.',
        SETUP,
      )}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>3 · Piece {state.piecesDone.length + 1}</h2>
          <span className={styles.sectionCount}>{doneCount(PER_PIECE, true)}/{PER_PIECE.length}</span>
        </div>
        <p className={styles.sectionBlurb}>
          The loop: same five shots and the facts captured while the piece is in your hands. Repeat for every piece — the list resets each time.
        </p>
        <input
          className={styles.pieceNameInput}
          placeholder="Working name — e.g. swan platter no. 4"
          value={state.pieceName}
          onChange={(e) => setState((s) => ({ ...s, pieceName: e.target.value }))}
        />
        <ul className={styles.steps}>
          {PER_PIECE.map((step) => (
            <li key={step.id}>
              <label className={`${styles.step} ${state.pieceChecked.includes(step.id) ? styles.stepDone : ''}`}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={state.pieceChecked.includes(step.id)}
                  onChange={() => toggle(step, true)}
                />
                <span className={styles.stepText}>
                  <span className={styles.stepLabel}>{step.label}</span>
                  {step.tip && <span className={styles.stepTip}>{step.tip}</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <button className={styles.nextPieceBtn} onClick={finishPiece} disabled={!pieceReady}>
          {pieceReady
            ? `✓ ${state.pieceName.trim() || `Piece ${state.piecesDone.length + 1}`} done — next piece`
            : 'Finish the shot list to move on'}
        </button>
        {state.piecesDone.length > 0 && (
          <div className={styles.doneList}>
            <span className={styles.doneLabel}>Shot today:</span>
            {state.piecesDone.map((name, i) => (
              <span key={i} className={styles.doneChip}>{name}</span>
            ))}
          </div>
        )}
      </section>

      {section(
        '4 · Wrap up & publish',
        'From camera roll to money, all on the phone — a shoot that isn’t published yet isn’t finished.',
        WRAP,
      )}
    </div>
  );
}
