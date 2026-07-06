'use client';

import ProductPhoto from './ProductPhoto';
import { useProductModal } from '@/lib/product-modal-context';
import type { Product } from '@/lib/products';
import styles from './LookbookGrid.module.css';

export default function LookbookGrid({ products }: { products: Product[] }) {
  const { openProduct } = useProductModal();

  return (
    <div className={styles.grid}>
      {products.map((p, i) => (
        <button key={p.id} className={styles.tile} onClick={() => openProduct(p.id)}>
          <ProductPhoto product={p} aspectRatio={i % 3 === 1 ? '380 / 300' : '1 / 1'} />
          <div className={styles.overlay}>
            <span className={styles.name}>{p.name}</span>
            <span className={styles.price}>{p.sold ? 'Sold' : `$${p.price}`}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
