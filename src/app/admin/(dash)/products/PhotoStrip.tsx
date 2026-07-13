'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../../admin.module.css';

/**
 * Review-time photo ordering. The first photo is the hero (the one that leads
 * the listing and shows on collection cards); up/down buttons reorder the rest.
 * The current order is mirrored into hidden fields so publishing goes through
 * the unchanged `saveProductAction`: `image` = hero, `photos` = the rest.
 */
export default function PhotoStrip({ photos, initialHero = 0 }: { photos: string[]; initialHero?: number }) {
  const start = photos.slice();
  if (initialHero > 0 && initialHero < start.length) {
    const [hero] = start.splice(initialHero, 1);
    start.unshift(hero);
  }
  const [order, setOrder] = useState<string[]>(start);

  const move = (i: number, delta: number) => {
    setOrder((cur) => {
      const j = i + delta;
      if (j < 0 || j >= cur.length) return cur;
      const next = cur.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const makeHero = (i: number) => {
    setOrder((cur) => {
      if (i === 0) return cur;
      const next = cur.slice();
      const [pick] = next.splice(i, 1);
      next.unshift(pick);
      return next;
    });
  };

  return (
    <div className={styles.field}>
      <span className={styles.label}>Photos</span>
      <span className={styles.hint}>The first photo leads the listing. Reorder if the hero shot isn’t first.</span>

      <input type="hidden" name="image" value={order[0] ?? ''} />
      <textarea name="photos" hidden readOnly value={order.slice(1).join('\n')} />

      <ul className={styles.photoStrip}>
        {order.map((src, i) => (
          <li key={src} className={styles.photoItem}>
            <div className={styles.photoThumb}>
              <Image src={src} alt="" fill sizes="120px" className={styles.photoImg} />
              {i === 0 && <span className={styles.photoHero}>Hero</span>}
            </div>
            <div className={styles.photoBtns}>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Move later">↓</button>
              {i !== 0 && (
                <button type="button" className={styles.photoHeroBtn} onClick={() => makeHero(i)}>
                  Make hero
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
