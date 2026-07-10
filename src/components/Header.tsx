'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { MARKET_LINE } from '@/lib/schedule';
import styles from './Header.module.css';

const INSTAGRAM_URL = 'https://instagram.com/lee.pottery.sydney';

export default function Header() {
  const { cartIds } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <header className={styles.header}>
      <button
        aria-label="Menu"
        className={styles.menuBtn}
        onClick={() => setDrawerOpen(true)}
      >
        <span className={styles.menuBar} />
        <span className={styles.menuBar} />
        <span className={styles.menuBar} />
      </button>

      <Link href="/" className={styles.logoLink}>
        <Image
          src="/images/brand/lee-pottery-logotype.png"
          alt="Lee Pottery"
          width={160}
          height={30}
          className={styles.logo}
          priority
        />
      </Link>

      <Link href="/cart" className={styles.cartLinkMobile}>Cart ({cartIds.length})</Link>

      <nav className={styles.nav}>
        <Link href="/collection" className={styles.navLink}>Collection</Link>
        <Link href="/lookbook" className={styles.navLink}>Lookbook</Link>
        <Link href="/artist" className={styles.navLink}>Artist</Link>
        <Link href="/enquire" className={styles.navLink}>Enquire</Link>
        <Link href="/cart" className={styles.navLink}>Cart ({cartIds.length})</Link>
      </nav>

      {drawerOpen && (
        <div className={styles.drawer}>
          <div className={styles.drawerTop}>
            <Image
              src="/images/brand/lee-pottery-logotype.png"
              alt="Lee Pottery"
              width={160}
              height={30}
              className={styles.logo}
            />
            <button aria-label="Close" className={styles.closeBtn} onClick={closeDrawer}>
              ×
            </button>
          </div>
          <div className={styles.drawerLinks}>
            <Link href="/collection" className={styles.drawerLink} onClick={closeDrawer}>Collection</Link>
            <Link href="/lookbook" className={styles.drawerLink} onClick={closeDrawer}>Lookbook</Link>
            <Link href="/artist" className={styles.drawerLink} onClick={closeDrawer}>Artist</Link>
            <Link href="/enquire" className={styles.drawerLink} onClick={closeDrawer}>Enquire</Link>
            <Link href="/cart" className={styles.drawerLink} onClick={closeDrawer}>Cart ({cartIds.length})</Link>
          </div>
          <div className={styles.drawerFooter}>
            <span className={styles.drawerFooterLabel}>Next market</span>
            <span className={styles.drawerFooterMarket}>{MARKET_LINE}</span>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className={styles.drawerFooterLink} onClick={closeDrawer}>
              @lee.pottery.sydney
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
