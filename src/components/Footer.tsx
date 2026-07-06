import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <span className={styles.wordmark}>Lee Pottery</span>
        <span className={styles.tagline}>from my hands, to your home · handmade in Sydney</span>
      </div>
      <Image src="/images/brand/swan-single.png" alt="" width={56} height={56} className={styles.swan} />
      <div className={styles.links}>
        <Link href="/enquire" className={styles.linkBtn}>Commissions & enquiries</Link>
        <Link href="/lookbook" className={styles.linkBtn}>For galleries & markets</Link>
        <a href="https://instagram.com/lee.pottery.sydney" target="_blank" rel="noopener">@lee.pottery.sydney</a>
      </div>
    </footer>
  );
}
