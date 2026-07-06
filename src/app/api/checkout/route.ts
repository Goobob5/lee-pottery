import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS } from '@/lib/products';
import { getStripe } from '@/lib/stripe';

const SHIPPING_CENTS = 2500;

export async function POST(request: NextRequest) {
  let ids: unknown;
  try {
    const body = await request.json();
    ids = body?.ids;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
  }

  // Server is the source of truth for price and availability — never trust
  // amounts from the client.
  const items = ids
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is (typeof PRODUCTS)[number] => !!p && !p.sold);

  if (items.length === 0) {
    return NextResponse.json({ error: 'These pieces are no longer available' }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Stripe is not configured' }, { status: 500 });
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
      success_url: `${origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: { product_ids: items.map((p) => p.id).join(',') },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Could not create checkout session' }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Stripe checkout failed' }, { status: 500 });
  }
}
