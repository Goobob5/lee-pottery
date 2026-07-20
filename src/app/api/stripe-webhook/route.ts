import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { addSubscriber, getProductById, hasDb, insertOrder, recordSale, releaseHolds } from '@/lib/db';
import { CATALOG_TAG } from '@/lib/catalog';
import { notifyNewOrder } from '@/lib/notify';
import { parseEmail } from '@/lib/newsletter';

/**
 * Stripe webhook: the moment a checkout completes, take the pieces off the
 * shelf and email Richard. Configure the endpoint in the Stripe dashboard
 * for `checkout.session.completed` and `checkout.session.expired`, and put
 * its signing secret in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not set — add it to your environment to enable the webhook.' },
      { status: 500 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Stripe is not configured' }, { status: 500 });
  }

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!hasDb()) {
    // Nothing to update — the static catalog is edited by hand. Acknowledge
    // so Stripe doesn't retry forever, but leave a trace.
    console.warn(`Stripe event ${event.type} received but DATABASE_URL is not set; stock not updated.`);
    return NextResponse.json({ received: true });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const productIds = (session.metadata?.product_ids ?? '').split(',').filter(Boolean);

      const details = session.customer_details;
      const address = details?.address;
      const isNew = await insertOrder({
        stripeSessionId: session.id,
        email: details?.email ?? null,
        customerName: details?.name ?? null,
        amountTotalCents: session.amount_total,
        productIds,
        shipping: address ?? null,
      });

      // insertOrder is the idempotency gate: Stripe retries deliveries, and
      // stock must only come down once per session.
      if (isNew && productIds.length) {
        const soldPieces = await Promise.all(productIds.map((id) => getProductById(id)));
        const itemNames = productIds.map((id, i) => soldPieces[i]?.name ?? id);
        await recordSale(productIds, 'online');
        // The sold piece must leave the public site immediately, so the
        // cached catalog is expired (not lazily revalidated) and the
        // prerendered pages are marked stale.
        revalidateTag(CATALOG_TAG, { expire: 0 });
        revalidatePath('/', 'layout');
        const shippingSummary = address
          ? [address.line1, address.line2, address.city, address.state, address.postal_code]
              .filter(Boolean)
              .join(', ')
          : null;
        await notifyNewOrder({
          customerName: details?.name ?? null,
          email: details?.email ?? null,
          amountTotalCents: session.amount_total,
          itemNames,
          shippingSummary,
        });
      }

      // Checkout newsletter opt-in: only if they ticked the box and Stripe gave
      // us a usable email. Guarded by isNew so a webhook retry can't re-add.
      if (isNew && session.metadata?.newsletter_opt_in === 'true') {
        const email = parseEmail(details?.email);
        if (email) {
          await addSubscriber(email, 'checkout').catch((e) =>
            console.error('Checkout newsletter opt-in failed:', e),
          );
        }
      }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const productIds = (session.metadata?.product_ids ?? '').split(',').filter(Boolean);
      await releaseHolds(productIds);
    }
  } catch (e) {
    console.error(`Stripe webhook handling failed for ${event.type}:`, e);
    // Non-200 makes Stripe retry — insertOrder's idempotency makes that safe.
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
