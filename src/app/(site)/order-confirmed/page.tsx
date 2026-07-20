import Link from 'next/link';
import Button from '@/components/Button';
import { getStripe } from '@/lib/stripe';
import ClearCart from './ClearCart';
import styles from './OrderConfirmedPage.module.css';

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let paid = false;
  let checkedSession = false;
  let pickup = false;
  let totalCents: number | null = null;
  if (session_id && process.env.STRIPE_SECRET_KEY) {
    checkedSession = true;
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      paid = session.payment_status === 'paid';
      // The pickup option collects $0 shipping; anything else was shipped.
      pickup = session.shipping_cost != null && session.shipping_cost.amount_total === 0;
      totalCents = session.amount_total;
    } catch {
      paid = false;
    }
  }
  const total = totalCents != null ? `$${(totalCents / 100).toFixed(2)} AUD` : null;

  return (
    <div data-screen-label="Order confirmation" style={{ borderTop: '1px solid var(--cream-300)' }}>
      <section className={styles.section}>
        {paid && <ClearCart />}
        <h1 className={styles.title}>It&rsquo;s on its way to becoming yours.</h1>
        {pickup ? (
          <p className={styles.body}>
            You chose free local pickup — I&rsquo;ll email you to arrange a time and place, whether that&rsquo;s my
            studio in Rosebery, my home in Surry Hills, or the next market. Thank you for giving this piece a home.
          </p>
        ) : (
          <p className={styles.body}>
            I&rsquo;ll pack it myself this week — plenty of paper, no plastic — and send you a photo of the parcel
            with tracking. Thank you for giving this piece a home.
          </p>
        )}
        {paid && total && (
          <p className={styles.total}>
            {pickup ? 'Free local pickup' : 'Shipped'} · Total paid {total}
          </p>
        )}
        <span className={styles.signature}>Richard</span>
        {checkedSession && !paid && (
          <p className={styles.warning}>
            We couldn&rsquo;t confirm this payment just yet — if you were charged and this keeps happening, get in
            touch and I&rsquo;ll sort it out by hand.
          </p>
        )}
        <Link href="/collection">
          <Button variant="secondary">Back to the collection</Button>
        </Link>
      </section>
    </div>
  );
}
