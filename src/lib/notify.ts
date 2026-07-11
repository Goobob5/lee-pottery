/**
 * Order notification email via Resend's REST API (no SDK needed).
 * Fails soft: a missing key or a Resend outage must never fail the Stripe
 * webhook — the sale is already recorded, the email is a courtesy.
 */

export type OrderNotification = {
  customerName: string | null;
  email: string | null;
  amountTotalCents: number | null;
  itemNames: string[];
  shippingSummary: string | null;
};

export async function notifyNewOrder(order: OrderNotification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping order notification email.');
    return;
  }
  const to = process.env.ORDER_NOTIFY_TO || 'richard@leepottery.com.au';
  const from = process.env.ORDER_NOTIFY_FROM || 'Lee Pottery orders <orders@leepottery.com.au>';

  const total =
    order.amountTotalCents != null ? `$${(order.amountTotalCents / 100).toFixed(2)} AUD` : 'unknown total';
  const lines = [
    `New order — ${total}`,
    '',
    ...order.itemNames.map((n) => `• ${n}`),
    '',
    `Buyer: ${order.customerName ?? 'unknown'} (${order.email ?? 'no email'})`,
    order.shippingSummary ? `Ship to: ${order.shippingSummary}` : 'No shipping address collected.',
    '',
    'Full details are in the Stripe dashboard and /admin/orders.',
  ];

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `🏺 Sold online: ${order.itemNames.join(', ') || 'new order'}`,
        text: lines.join('\n'),
      }),
    });
    if (!res.ok) {
      console.error('Resend rejected order notification:', res.status, await res.text());
    }
  } catch (e) {
    console.error('Order notification email failed:', e);
  }
}
