import Image from 'next/image';
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
  if (session_id && process.env.STRIPE_SECRET_KEY) {
    checkedSession = true;
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      paid = session.payment_status === 'paid';
    } catch {
      paid = false;
    }
  }

  return (
    <div data-screen-label="Order confirmation" style={{ borderTop: '1px solid var(--cream-300)' }}>
      <section className={styles.section}>
        {paid && <ClearCart />}
        <Image src="/images/brand/swan-pair.png" alt="" width={220} height={150} className={styles.swan} />
        <h1 className={styles.title}>It&rsquo;s on its way to becoming yours.</h1>
        <p className={styles.body}>
          I&rsquo;ll pack it myself this week — plenty of paper, no plastic — and send you a photo of the parcel
          with tracking. Thank you for giving this piece a home.
        </p>
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
