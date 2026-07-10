'use client';

import Image from 'next/image';
import { useProductModal } from '@/lib/product-modal-context';
import type { Product } from '@/lib/products';
import styles from './LookbookEditorial.module.css';

const VARIANTS = ['full', 'right76', 'fullRight', 'splitRow', 'left76'] as const;

function kickerFor(p: Product) {
  return p.sold ? 'Sold' : p.oneOfAKind ? 'One of a kind' : p.batch || 'Small batch';
}

/** Photo-forward, editorial spread — bold serif names, numbered captions, staggered
 * full-bleed images. Used on mobile in place of the plain grid, which reads as
 * "bland ecommerce" at that scale; the grid is kept for desktop. */
export default function LookbookEditorial({ products }: { products: Product[] }) {
  const { openProduct } = useProductModal();
  const featured = products.filter((p) => p.image);
  const rest = products.filter((p) => !p.image);

  return (
    <div className={styles.spreads}>
      {featured.map((p, i) => {
        const variant = VARIANTS[i % VARIANTS.length];
        const num = String(i + 1).padStart(2, '0');
        const caption = `${p.meta}${p.sold ? '' : ` · $${p.price}`}`;

        if (variant === 'splitRow') {
          return (
            <button key={p.id} className={styles.splitRow} onClick={() => openProduct(p.id)}>
              <span className={styles.splitPhoto}>
                <Image src={p.image!} alt={p.name} fill sizes="60vw" className={styles.img} />
              </span>
              <span className={styles.splitCaption}>
                <span className={styles.kicker}>No. {num} · {kickerFor(p)}</span>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.meta}>{caption}</span>
              </span>
            </button>
          );
        }

        const photoClass = {
          full: styles.photoFull,
          right76: styles.photoRight76,
          fullRight: styles.photoTall,
          left76: styles.photoLeft76,
        }[variant];
        const captionClass = variant === 'fullRight' ? styles.captionRight : styles.caption;

        return (
          <button key={p.id} className={styles.spread} onClick={() => openProduct(p.id)}>
            <span className={photoClass}>
              <Image src={p.image!} alt={p.name} fill sizes="100vw" className={styles.img} />
            </span>
            <span className={captionClass}>
              <span className={styles.kicker}>No. {num} · {kickerFor(p)}</span>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.meta}>{caption}</span>
            </span>
          </button>
        );
      })}

      {rest.length > 0 && (
        <div className={styles.restList}>
          <span className={styles.restLabel}>Also in the studio</span>
          {rest.map((p) => (
            <button key={p.id} className={styles.restRow} onClick={() => openProduct(p.id)}>
              <span className={styles.restName}>{p.name}</span>
              <span className={styles.restPrice}>{p.sold ? 'Sold' : `$${p.price}`}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
