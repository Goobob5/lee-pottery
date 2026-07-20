import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS, Product } from '@/lib/products';
import { getStripe } from '@/lib/stripe';
import { CHECKOUT_SESSION_MINUTES, hasDb, holdForCheckout, releaseHolds } from '@/lib/db';

const SHIPPING_CENTS = 2500;

export async function POST(request: NextRequest) {
  let ids: unknown;
  let newsletterOptIn = false;
  try {
    const body = await request.json();
    ids = body?.ids;
    newsletterOptIn = body?.newsletterOptIn === true;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === 'string')) {
    return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
  }
  const uniqueIds = [...new Set(ids as string[])];

  // Server is the source of truth for price and availability — never trust
  // amounts from the client. With a database configured this also places a
  // time-limited hold on one-of-a-kind pieces so two buyers can't both pay
  // for the same piece.
  let items: Product[];
  let heldIds: string[] = [];
  if (hasDb()) {
    let hold;
    try {
      hold = await holdForCheckout(uniqueIds);
    } catch (e) {
      console.error('Checkout availability check failed:', e);
      return NextResponse.json({ error: 'Could not check availability — please try again.' }, { status: 500 });
    }
    if (!hold.ok) {
      const names = hold.unavailable.join(', ');
      return NextResponse.json(
        {
          error: names
            ? `Sorry — no longer available (or in someone else's checkout): ${names}. Remove to continue.`
            : 'These pieces are no longer available',
        },
        { status: 409 },
      );
    }
    items = hold.items;
    heldIds = hold.items.filter((p) => p.oneOfAKind).map((p) => p.id);
  } else {
    items = uniqueIds
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter((p): p is Product => !!p && !p.sold);
    if (items.length === 0) {
      return NextResponse.json({ error: 'These pieces are no longer available' }, { status: 400 });
    }
  }

  // From here on a failure must let the held pieces go again, or an aborted
  // checkout would lock a one-off for half an hour.
  const failWithRelease = async (message: string, status: number) => {
    if (heldIds.length) {
      await releaseHolds(heldIds).catch((e) => console.error('Failed to release checkout holds:', e));
    }
    return NextResponse.json({ error: message }, { status });
  };

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return failWithRelease(e instanceof Error ? e.message : 'Stripe is not configured', 500);
  }

  const origin = request.nextUrl.origin;

  const lineItems: Array<{
    price_data: {
      currency: string;
      product_data: { name: string; description?: string };
      unit_amount: number;
    };
    quantity: number;
  }> = items.map((p) => ({
    price_data: {
      currency: 'aud',
      product_data: { name: p.name, description: p.meta },
      unit_amount: Math.round(p.price * 100),
    },
    quantity: 1,
  }));

  lineItems.push({
    price_data: {
      currency: 'aud',
      product_data: { name: 'Shipping — packed by me, insured' },
      unit_amount: SHIPPING_CENTS,
    },
    quantity: 1,
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ['AU'] },
      // The session and the one-of-a-kind holds expire together (Stripe's
      // minimum is 30 minutes; the hold is slightly longer on purpose).
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_MINUTES * 60,
      success_url: `${origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      // The opt-in rides through to the webhook, which pairs it with the email
      // Stripe collects and adds them to the kiln-drop list if they ticked it.
      metadata: {
        product_ids: items.map((p) => p.id).join(','),
        newsletter_opt_in: newsletterOptIn ? 'true' : 'false',
      },
    });

    if (!session.url) {
      return failWithRelease('Could not create checkout session', 500);
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return failWithRelease(e instanceof Error ? e.message : 'Stripe checkout failed', 500);
  }
}
