'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import styles from './Header.module.css';

export default function Header() {
  const { cartIds } = useCart();

  return (
    <header className={styles.header}>
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
      <nav className={styles.nav}>
        <Link href="/collection" className={styles.navLink}>Collection</Link>
        <Link href="/lookbook" className={styles.navLink}>Lookbook</Link>
        <Link href="/artist" className={styles.navLink}>Artist</Link>
        <Link href="/enquire" className={styles.navLink}>Enquire</Link>
        <Link href="/cart" className={styles.navLink}>Cart ({cartIds.length})</Link>
      </nav>
    </header>
  );
}
