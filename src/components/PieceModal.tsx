'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProductModal } from '@/lib/product-modal-context';
import { useCart } from '@/lib/cart-context';
import { useCatalog } from '@/lib/catalog-context';
import { recommendationsFor } from '@/lib/products';
import PieceGallery from './PieceGallery';
import Button from './Button';
import styles from './PieceModal.module.css';

export default function PieceModal() {
  const { openId, openProduct, closeModal } = useProductModal();
  const { addToCart, isInCart } = useCart();
  const { products, getProduct } = useCatalog();
  const router = useRouter();

  if (!openId) return null;
  const cur = getProduct(openId);
  if (!cur) return null;

  const recs = recommendationsFor(products, cur);
  const inCart = isInCart(cur.id);
  const kicker = cur.sold ? 'Sold' : cur.oneOfAKind ? 'One of a kind' : cur.batch || 'Small batch';

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  function askAboutSimilar() {
    closeModal();
    router.push(`/enquire?topic=${encodeURIComponent('A commission')}&similar=${encodeURIComponent(cur!.name)}`);
  }

  return (
    <div className={styles.backdrop} onClick={closeModal}>
      <div className={styles.modal} onClick={stop} data-screen-label="Piece modal">
        <button onClick={closeModal} aria-label="Close" className={styles.closeBtn}>
          ×
        </button>

        <div className={styles.top}>
          <PieceGallery product={cur} priority />
          <div className={styles.info}>
            <span className={styles.kicker}>{kicker}</span>
            <h2 className={styles.title}>{cur.name}</h2>
            <p className={styles.desc}>{cur.desc}</p>

            <div className={styles.note}>
              <div className={styles.noteAvatar}>
                <Image src="/images/studio/richard-face.webp" alt="Richard" fill sizes="52px" style={{ objectFit: 'cover' }} />
              </div>
              <div className={styles.noteText}>
                <p>&ldquo;{cur.note}&rdquo;</p>
                <span className={styles.signature}>Richard</span>
              </div>
            </div>

            <div className={styles.specs}>
              <div className={styles.specRow}>
                <span>Size</span>
                <span>{cur.dims}</span>
              </div>
              <div className={styles.specRow}>
                <span>Clay & glaze</span>
                <span>{cur.material}</span>
              </div>
              <div className={styles.specRow}>
                <span>Care</span>
                <span>Dishwasher & microwave safe</span>
              </div>
            </div>

            {!cur.sold ? (
              <>
                <div className={styles.buyRow}>
                  <span className={styles.price}>${cur.price}</span>
                  <Button size="lg" onClick={() => addToCart(cur!.id)}>
                    {inCart ? 'In your cart' : 'Take me home'}
                  </Button>
                </div>
                <p className={styles.shipNote}>
                  Pick me up! I&rsquo;m precious, but I&rsquo;m not fragile — carefully packed and shipped anywhere in Australia.
                </p>
              </>
            ) : (
              <div className={styles.soldBox}>
                <span>This one has found a home.</span>
                <Button variant="secondary" onClick={askAboutSimilar}>
                  Ask me about a similar piece
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.recs}>
          <span className={styles.recsLabel}>In the mood for…</span>
          <div className={styles.recsGrid}>
            {recs.map((r) => (
              <button key={r.product.id} className={styles.recCard} onClick={() => openProduct(r.product.id)}>
                <div className={styles.recPhoto}>
                  {r.product.image ? (
                    <Image src={r.product.image} alt={r.product.name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                  ) : null}
                </div>
                <div className={styles.recInfo}>
                  <span className={styles.recLabel}>{r.label}</span>
                  <span className={styles.recName}>{r.product.name}</span>
                  <span className={styles.recPrice}>{r.product.sold ? 'Sold' : `$${r.product.price}`}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
