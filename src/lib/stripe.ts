import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

/** Server-only. Throws if STRIPE_SECRET_KEY isn't configured — callers should
 * catch this and surface a clear setup error rather than a generic 500. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set — add it to your environment to enable checkout.');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}
