import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { logoutAction } from '@/lib/admin-actions';
import { hasDb } from '@/lib/db';
import styles from '../admin.module.css';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <nav className={styles.nav}>
        <Link href="/admin" className={styles.navBrand}>Lee Pottery</Link>
        <Link href="/admin" className={styles.navLink}>Pieces</Link>
        <Link href="/admin/new-piece" className={styles.navLink}>Add a piece</Link>
        <Link href="/admin/shoot" className={styles.navLink}>Photoshoot day</Link>
        <Link href="/admin/orders" className={styles.navLink}>Orders</Link>
        <Link href="/admin/sales" className={styles.navLink}>Sales log</Link>
        <Link href="/admin/newsletter" className={styles.navLink}>Newsletter</Link>
        <span className={styles.navSpacer} />
        <Link href="/" className={styles.navLink}>View site</Link>
        <form action={logoutAction}>
          <button type="submit" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}>
            Log out
          </button>
        </form>
      </nav>
      <div className={styles.page}>
        {!hasDb() && (
          <div className={styles.banner}>
            <strong>No database connected.</strong> The site is serving the placeholder catalog from
            code, and stock changes here are disabled. Set <code>DATABASE_URL</code> (a free Neon
            Postgres works) and redeploy — the tables and starting catalog are created automatically.
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
