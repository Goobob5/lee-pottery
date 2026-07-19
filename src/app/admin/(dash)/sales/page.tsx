import { hasDb, listSales } from '@/lib/db';
import styles from '../../admin.module.css';

export default async function SalesPage() {
  const sales = hasDb() ? await listSales() : [];

  const total = sales.reduce((sum, s) => sum + s.price_cents, 0);

  return (
    <>
      <div>
        <h1 className={styles.title}>Sales log</h1>
        <p className={styles.subtitle}>
          Every piece that&rsquo;s gone — online and at the stall — with what it sold for. Marking a
          piece “Sold at market” adds it here automatically.
        </p>
      </div>

      {sales.length > 0 && (
        <p className={styles.subtitle}>
          {sales.length} {sales.length === 1 ? 'sale' : 'sales'} · ${(total / 100).toFixed(2)} total
        </p>
      )}

      <div className={styles.card}>
        {sales.map((s) => {
          const channel = s.channel === 'in-person' ? 'At market' : s.channel === 'online' ? 'Online' : s.channel;
          return (
            <div key={s.id} className={styles.orderRow}>
              <div className={styles.orderHead}>
                <span>{s.product_name}</span>
                <span>${(s.price_cents / 100).toFixed(2)}</span>
              </div>
              <span className={styles.orderDetail}>
                {new Date(s.sold_at).toLocaleString('en-AU', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  timeZone: 'Australia/Sydney',
                })}
                {' · '}
                {channel}
              </span>
            </div>
          );
        })}
        {sales.length === 0 && (
          <div className={styles.emptyState}>
            {hasDb()
              ? 'No sales recorded yet — they’ll appear here as pieces sell online or at the stall.'
              : 'Connect a database to keep a sales history.'}
          </div>
        )}
      </div>
    </>
  );
}
