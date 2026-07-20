import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { hasDb, listSubscribers } from '@/lib/db';

/** Escapes a value for a CSV cell (quotes, commas, newlines). */
function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Admin-only CSV of the kiln-drop list, for a spreadsheet or handing to an ESP
 * later. Guarded directly (not via requireAdmin, which redirects) so an
 * unauthorised request gets a clean 401 rather than an HTML login page.
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
  }
  if (!hasDb()) {
    return NextResponse.json({ error: 'No database connected' }, { status: 503 });
  }

  const subscribers = await listSubscribers();
  const header = ['email', 'source', 'consent_at', 'unsubscribed_at'];
  const rows = subscribers.map((s) =>
    [
      s.email,
      s.source,
      s.consent_at.toISOString(),
      s.unsubscribed_at ? s.unsubscribed_at.toISOString() : '',
    ]
      .map(csvCell)
      .join(','),
  );
  const csv = [header.join(','), ...rows].join('\n');
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kiln-drop-subscribers-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
