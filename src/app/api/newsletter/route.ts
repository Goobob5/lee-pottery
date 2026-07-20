import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, hasDb } from '@/lib/db';
import { parseEmail } from '@/lib/newsletter';

/**
 * Public sign-up for the kiln-drop newsletter, used by the home-page popup.
 * Only stores an email and where it came from — no marketing send happens here.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = parseEmail((body as { email?: unknown })?.email);
  if (!email) {
    return NextResponse.json({ error: 'That email doesn’t look quite right.' }, { status: 400 });
  }

  if (!hasDb()) {
    // No database configured (placeholder-catalog mode). Don't pretend to have
    // saved anything — mirror how the rest of the site degrades without a DB.
    return NextResponse.json(
      { error: 'Sign-ups aren’t connected yet — please try again soon.' },
      { status: 503 },
    );
  }

  try {
    await addSubscriber(email, 'home-popup');
  } catch (e) {
    console.error('Newsletter sign-up failed:', e);
    return NextResponse.json({ error: 'Could not sign you up — please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
