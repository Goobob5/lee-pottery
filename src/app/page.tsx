'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import ProductPhoto from '@/components/ProductPhoto';
import LookbookGrid from '@/components/LookbookGrid';
import { useProductModal } from '@/lib/product-modal-context';
import { PRODUCTS, getProduct } from '@/lib/products';
import styles from './HomePage.module.css';

const SCHEDULE = [
  { status: 'Every fourth Saturday', label: 'Kirribilli Markets', detail: 'Monthly · Bradfield Park, Milsons Point' },
  { status: 'Sep 18–20', label: 'Big Design Market', detail: 'Come find my stall · Sydney' },
  { status: 'Open now', label: 'Commissions', detail: 'A few slots open this season' },
];

const INSTAGRAM_URL = 'https://instagram.com/lee.pottery.sydney';

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Home() {
  const { openProduct } = useProductModal();
  const [heroId, setHeroId] = useState('swan-platter-3');

  const hero = getProduct(heroId) || PRODUCTS[0];
  const heroKicker = hero.oneOfAKind ? 'One of a kind' : hero.batch || 'Small batch';
  const homeThumbs = PRODUCTS.filter((p) => p.id !== hero.id && !p.sold).slice(0, 4);

  return (
    <div data-screen-label="Home">
      {/* Intro banner — recreates the market table banner */}
      <section className={styles.hero}>
        <Image src="/images/brand/crocodile-single.png" alt="" width={390} height={164} className={styles.heroAnimal} />
        <div className={styles.heroInner}>
          <div className={styles.portraitWrap}>
            <div className={styles.portraitGlow} />
            <div className={styles.portraitShadow} />
            <Image
              src="/images/brand/richard-portrait.png"
              alt="Richard of Lee Pottery holding a vase of flowers"
              width={530}
              height={700}
              className={styles.portraitImg}
              priority
            />
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.heroHeadline}>From my hands, to your home</h1>
            <p className={styles.heroSub}>
              Sculpture and tableware thrown by hand — the harbour&rsquo;s swans, crocodiles and crabs, brushed on in cobalt.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/collection">
                <Button size="md">Browse the collection</Button>
              </Link>
              <Link href="/artist" className={styles.textLink}>More about the artist</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Where to find me */}
      <section className={styles.findSection}>
        <h2 className={styles.findHeading}>Where to find me</h2>
        <div className={styles.scheduleGrid}>
          {SCHEDULE.map((e) => (
            <div key={e.label} className={styles.scheduleCard}>
              <span className={styles.scheduleStatus}>
                <span className={styles.scheduleDot} />
                {e.status}
              </span>
              <span className={styles.scheduleLabel}>{e.label}</span>
              <span className={styles.scheduleDetail}>{e.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured piece */}
      <section className={styles.featured}>
        <ProductPhoto product={hero} className={styles.featuredPhoto} priority sizes="(max-width: 760px) 100vw, 60vw" />
        <div className={styles.featuredPanel}>
          <span className={styles.featuredKicker}>On the wheel this week · {heroKicker}</span>
          <button className={styles.featuredTitle} onClick={() => openProduct(hero.id)}>
            {hero.name}
          </button>
          <p className={styles.featuredDesc}>{hero.desc}</p>
          <div className={styles.noteBox}>
            <div className={styles.noteAvatar}>
              <Image src="/images/studio/richard-face.webp" alt="Richard" fill sizes="52px" style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.noteText}>
              <p>&ldquo;{hero.note}&rdquo;</p>
              <span className={styles.signature}>Richard</span>
            </div>
          </div>
          <div className={styles.featuredCtas}>
            <Button size="md" onClick={() => openProduct(hero.id)}>Explore this piece</Button>
          </div>
        </div>
      </section>

      {/* Thumbnail strip — tap to bring a piece into the frame */}
      <section className={styles.thumbStrip}>
        {homeThumbs.map((t) => (
          <button key={t.id} className={styles.thumbTile} onClick={() => setHeroId(t.id)}>
            <ProductPhoto product={t} className={styles.thumbPhoto} />
            <div className={styles.thumbOverlay} />
          </button>
        ))}
      </section>

      {/* For galleries & markets */}
      <section className={styles.galleristBand}>
        <div className={styles.galleristLeft}>
          <p className={styles.galleristText}>
            Gallerist, stockist or market holder? See the exhibitions, wholesale and market opportunities I&rsquo;m open to — and commission enquiries are always welcome.
          </p>
        </div>
        <Link href="/lookbook">
          <Button variant="secondary">For galleries & markets</Button>
        </Link>
      </section>

      {/* The lookbook, inline */}
      <section className={`${styles.section} ${styles.withTopRule}`}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionHeadCol}>
            <h2 className={styles.sectionTitle}>The lookbook</h2>
            <span className={styles.sectionSub}>A wander through current and past work — tap any piece to see it.</span>
          </div>
          <Link href="/collection" className={styles.textLink}>See the full collection →</Link>
        </div>
        <LookbookGrid products={PRODUCTS} />
      </section>

      {/* Instagram — newest from the studio */}
      <section className={`${styles.section} ${styles.withTopRule}`}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionHeadCol}>
            <span className={styles.igEyebrow}>Follow and see how it&rsquo;s made</span>
            <h2 className={styles.sectionTitle}>Newest from the studio</h2>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className={styles.igHandle}>@lee.pottery.sydney</a>
          </div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className={styles.igFollowBtn}>
            <InstagramIcon />
            Follow on Instagram
          </a>
        </div>
        <div className={styles.igGrid}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <a key={n} href={INSTAGRAM_URL} target="_blank" rel="noopener" className={styles.igTile}>
              <span className={styles.igPlaceholderLabel}>Latest post {n}</span>
              <div className={styles.igOverlay}>
                <InstagramIcon size={26} />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
