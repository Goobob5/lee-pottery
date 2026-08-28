'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { piecePhotos } from '@/lib/site';
import styles from './PieceGallery.module.css';

type PieceGalleryProps = {
  product: Product;
  priority?: boolean;
};

/** The piece's main photo(s), shown uncropped (never covers/crops the piece).
 * Most products only have one photo today, so this renders as a single plain
 * frame — the swipeable/thumbnail-strip gallery activates automatically once
 * a piece has more than one photo (hero plus extras). */
export default function PieceGallery({ product, priority = false }: PieceGalleryProps) {
  const photos = piecePhotos(product);
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className={styles.frame}>
        <div className={styles.placeholder}>
          <span className={styles.placeholderName}>{product.name}</span>
          <span className={styles.placeholderNote}>Photo coming soon</span>
        </div>
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div className={styles.frame}>
        <Image
          src={photos[0]}
          alt={product.name}
          fill
          sizes="(max-width: 760px) 100vw, 440px"
          priority={priority}
          className={styles.img}
        />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.frame}>
        <Image
          src={photos[active]}
          alt={product.name}
          fill
          sizes="(max-width: 760px) 100vw, 440px"
          priority={priority}
          className={styles.img}
        />
      </div>

      {/* Mobile: swipe between photos directly on the main frame */}
      <div
        className={styles.mobileSlides}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== active) setActive(i);
        }}
      >
        {photos.map((src, i) => (
          <div key={src + i} className={styles.mobileSlide}>
            <Image src={src} alt={`${product.name} — photo ${i + 1}`} fill sizes="100vw" className={styles.img} />
          </div>
        ))}
      </div>
      <div className={styles.dotsRow}>
        {photos.map((src, i) => (
          <span key={src + i} className={i === active ? styles.dotActive : styles.dot} />
        ))}
        <span className={styles.swipeHint}>Swipe for more photos</span>
      </div>

      {/* Desktop: thumbnail strip under the main frame */}
      <div className={styles.thumbStrip}>
        {photos.map((src, i) => (
          <button
            key={src + i}
            aria-label={`Photo ${i + 1}`}
            className={i === active ? styles.thumbActive : styles.thumb}
            onClick={() => setActive(i)}
          >
            <Image src={src} alt="" fill sizes="64px" className={styles.thumbImg} />
          </button>
        ))}
      </div>
    </div>
  );
}
