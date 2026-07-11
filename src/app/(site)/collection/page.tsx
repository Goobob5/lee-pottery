'use client';

import { useState } from 'react';
import ProductPhoto from '@/components/ProductPhoto';
import { useProductModal } from '@/lib/product-modal-context';
import { useCatalog } from '@/lib/catalog-context';
import { FILTER_TYPES } from '@/lib/products';
import styles from './CollectionPage.module.css';

export default function CollectionPage() {
  const { openProduct } = useProductModal();
  const { products } = useCatalog();
  const [filter, setFilter] = useState<string>('All');

  const list = products.filter((p) => filter === 'All' || p.type === filter);

  return (
    <div className={styles.page} data-screen-label="Collection">
      <div className={styles.header}>
        <h1 className={styles.title}>The collection</h1>
        <span className={styles.count}>{list.length} {list.length === 1 ? 'piece' : 'pieces'}</span>
      </div>
      <p className={styles.subtitle}>Most pieces exist once — when they&rsquo;re gone, they&rsquo;re gone. Small batches are noted.</p>

      <div className={styles.filters}>
        {FILTER_TYPES.map((label) => (
          <button
            key={label}
            className={`${styles.filterChip} ${filter === label ? styles.active : ''}`}
            onClick={() => setFilter(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {list.map((p) => {
          const showBadge = !p.sold && p.oneOfAKind;
          return (
            <button key={p.id} className={styles.card} onClick={() => openProduct(p.id)}>
              <div className={styles.photoWrap}>
                <ProductPhoto product={p} className={styles.photo} sizes="(max-width: 1040px) 50vw, 33vw" />
                {p.sold && <span className={`${styles.badge} ${styles.badgeSold}`}>Sold</span>}
                {showBadge && <span className={`${styles.badge} ${styles.badgeOneOfAKind}`}>One of a kind</span>}
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardName}>{p.name}</span>
                <span className={`${styles.cardPrice} ${p.sold ? styles.priceSold : styles.priceAvailable}`}>
                  ${p.price}
                </span>
              </div>
              <span className={styles.cardMeta}>{p.meta}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
