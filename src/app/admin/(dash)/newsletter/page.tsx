import { hasDb, listSubscribers } from '@/lib/db';
import styles from '../../admin.module.css';
import NewsletterTools from './NewsletterTools';

const SOURCE_LABELS: Record<string, string> = {
  'home-popup': 'Home popup',
  checkout: 'Checkout',
};

export default async function NewsletterPage() {
  const subscribers = hasDb() ? await listSubscribers() : [];
  const active = subscribers.filter((s) => !s.unsubscribed_at);

  return (
    <>
      <div>
        <h1 className={styles.title}>Kiln-drop newsletter</h1>
        <p className={styles.subtitle}>
          Everyone who asked to be told when new work drops — from the home-page popup or by ticking
          the box at checkout. Download the list, or copy the emails to paste into your email&rsquo;s
          Bcc for a drop announcement.
        </p>
      </div>

      {active.length > 0 && (
        <p className={styles.subtitle}>
          {active.length} {active.length === 1 ? 'subscriber' : 'subscribers'}
        </p>
      )}

      <NewsletterTools emails={active.map((s) => s.email)} />

      <div className={styles.card}>
        {subscribers.map((s) => (
          <div key={s.id} className={styles.orderRow}>
            <div className={styles.orderHead}>
              <span>{s.email}</span>
              <span>{SOURCE_LABELS[s.source] ?? s.source}</span>
            </div>
            <span className={styles.orderDetail}>
              {new Date(s.created_at).toLocaleString('en-AU', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Australia/Sydney',
              })}
              {s.unsubscribed_at ? ' · unsubscribed' : ''}
            </span>
          </div>
        ))}
        {subscribers.length === 0 && (
          <div className={styles.emptyState}>
            {hasDb()
              ? 'No sign-ups yet — they’ll appear here as visitors join from the popup or checkout.'
              : 'Connect a database to collect newsletter sign-ups.'}
          </div>
        )}
      </div>
    </>
  );
}
