'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProductModal } from '@/lib/product-modal-context';
import { useCart } from '@/lib/cart-context';
import { useCatalog } from '@/lib/catalog-context';
import { recommendationsFor } from '@/lib/products';
import { piecePath } from '@/lib/site';
import PieceGallery from './PieceGallery';
import Button from './Button';
import styles from './PieceModal.module.css';

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export default function PieceModal() {
  const { openProduct, closeModal } = useProductModal();
  const { addToCart, isInCart } = useCart();
  const { products, getProduct } = useCatalog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');

  // The open piece lives in the URL — see product-modal-context. Reading it here
  // (behind the layout's Suspense boundary) keeps the shared site layout static.
  const openId = searchParams.get('piece');

  useEffect(() => {
    if (!openId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId, closeModal]);

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

  // Share the canonical collection URL for this piece — honest wherever the
  // modal was opened from. Uses the native share sheet on phones, falls back to
  // copying the link with brief confirmation.
  async function sharePiece() {
    const url = `${window.location.origin}${piecePath(cur!.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: cur!.name, url });
        return;
      } catch {
        // Cancelled or unsupported — fall through to copying instead.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context) — surface the link to copy by hand.
      window.prompt('Copy this link', url);
    }
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
            <div className={styles.kickerRow}>
              <span className={styles.kicker}>{kicker}</span>
              <button type="button" className={styles.shareBtn} onClick={sharePiece}>
                {shareState === 'copied' ? (
                  'Link copied ✓'
                ) : (
                  <>
                    <ShareIcon /> Share
                  </>
                )}
              </button>
            </div>
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
                {inCart && (
                  <Link href="/cart" className={styles.checkoutLink} onClick={closeModal}>
                    Go to checkout →
                  </Link>
                )}
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
