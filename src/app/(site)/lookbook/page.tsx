'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import LookbookGrid from '@/components/LookbookGrid';
import LookbookEditorial from '@/components/LookbookEditorial';
import { useCatalog } from '@/lib/catalog-context';
import styles from './LookbookPage.module.css';

export default function LookbookPage() {
  const router = useRouter();
  const { products } = useCatalog();

  return (
    <div className={styles.page} data-screen-label="Lookbook">
      <section className={styles.top}>
        <div className={styles.left}>
          <span className={styles.eyebrow}>For gallerists & market holders</span>
          <h1 className={styles.title}>Lookbook</h1>
          <p className={styles.desc}>
            A selection of current and past work — sculpture and tableware in speckled stoneware with cobalt
            brushwork. Pieces marked sold can usually be remade as a similar (never identical) work.
          </p>
        </div>
        <div className={styles.panel}>
          <span className={styles.panelLabel}>I&rsquo;m open to</span>
          <ul className={styles.panelList}>
            <li>Gallery exhibitions — group or solo</li>
            <li>Retail stockists — consignment or wholesale</li>
            <li>Market stalls & maker fairs</li>
            <li>Collaborations with chefs & florists</li>
          </ul>
          <Button
            variant="secondary"
            style={{ width: '100%' }}
            onClick={() => router.push(`/enquire?topic=${encodeURIComponent('Stocking my work')}`)}
          >
            Talk to me about stocking my work
          </Button>
        </div>
      </section>
      {/* Mobile: photo-forward editorial spread. Desktop: the grid, which already holds up at 1280. */}
      <section className={styles.editorial}>
        <LookbookEditorial products={products} />
      </section>
      <section className={styles.grid}>
        <LookbookGrid products={products} />
      </section>
    </div>
  );
}
