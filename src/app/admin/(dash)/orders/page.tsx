import { hasDb, listOrders } from '@/lib/db';
import styles from '../../admin.module.css';

export default async function OrdersPage() {
  const orders = hasDb() ? await listOrders() : [];

  return (
    <>
      <div>
        <h1 className={styles.title}>Online orders</h1>
        <p className={styles.subtitle}>
          Recorded by the Stripe webhook the moment payment lands. Refunds and receipts live in the Stripe dashboard.
        </p>
      </div>
      <div className={styles.card}>
        {orders.map((o) => {
          const total = o.amount_total_cents != null ? `$${(o.amount_total_cents / 100).toFixed(2)}` : '—';
          const shipTo = o.shipping
            ? [o.shipping.line1, o.shipping.line2, o.shipping.city, o.shipping.state, o.shipping.postal_code]
                .filter(Boolean)
                .join(', ')
            : null;
          return (
            <div key={o.id} className={styles.orderRow}>
              <div className={styles.orderHead}>
                <span>{o.customer_name ?? o.email ?? 'Unknown buyer'}</span>
                <span>{total}</span>
              </div>
              <span className={styles.orderDetail}>
                {new Date(o.created_at).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                {' · '}
                {o.product_ids.join(', ')}
              </span>
              {shipTo && <span className={styles.orderDetail}>Ship to: {shipTo}</span>}
              {o.email && <span className={styles.orderDetail}>{o.email}</span>}
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className={styles.emptyState}>
            No online orders yet — they&rsquo;ll appear here as soon as the first one lands.
          </div>
        )}
      </div>
    </>
  );
}
