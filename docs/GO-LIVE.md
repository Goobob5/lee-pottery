# Go-live checklist — leepottery.com.au

Click-by-click setup for taking the shop live. Everything here is a one-time
task done in a browser; no code changes required.

> **Golden rule:** Vercel environment variables only take effect on the next
> deployment. After adding/changing any variable: project → **Deployments** →
> "⋯" on the latest deployment → **Redeploy**. You can add several variables,
> then redeploy once.

**Recommended order:** 1 → 2 (site is safe and manageable with just these;
replace the placeholder catalog before payments exist) → 3 in **test mode** +
a fake purchase → flip Stripe live + 5 together → 4 whenever.

---

## 1. Neon database → `DATABASE_URL`

Easiest path is Vercel's built-in integration:

1. **vercel.com → your project → Storage → Create Database → Neon →
   Continue.** Free plan. Region: **Sydney (ap-southeast-2)** if offered,
   otherwise Singapore.
2. When asked which environments to connect, tick **Production** (and
   Preview if you like). This creates the database *and* sets `DATABASE_URL`
   automatically.
3. Redeploy, then load any page of the site once — the first request creates
   the tables and seeds the starting catalog automatically.
4. **Verify:** `/admin` no longer shows the yellow "No database connected"
   banner, and pieces have stock controls.

Manual alternative: neon.tech → create project → **Connect** → copy the
**pooled** connection string (host contains `-pooler`) → Vercel → Settings →
Environment Variables → `DATABASE_URL`.

## 2. `ADMIN_PASSWORD`

1. Generate a long random password (password-manager generator, or
   `openssl rand -base64 24` in a terminal). Save it in the password manager.
2. Vercel → Settings → Environment Variables → add `ADMIN_PASSWORD`
   (Production). Redeploy.
3. **Verify:** log in at `leepottery.com.au/admin` on the phone. The session
   lasts 30 days, so market days are just open-bookmark → tap **Sold**.

## 3. Stripe keys + webhook

Do all of this in **test mode** first (toggle top-right of the Stripe
dashboard), verify with a fake purchase, then repeat the same values in live
mode.

1. **Secret key:** Developers → API keys → Secret key → Reveal → copy
   (`sk_test_...`) → Vercel env var `STRIPE_SECRET_KEY`.
2. **Webhook:** Developers → Webhooks → **Add endpoint** (newer dashboards:
   *Add destination → Webhook endpoint*):
   - URL: `https://leepottery.com.au/api/stripe-webhook`
   - Events — exactly two: `checkout.session.completed` and
     `checkout.session.expired`
   - Create → on the endpoint page, **Reveal** the *Signing secret* → copy
     the `whsec_...` → Vercel env var `STRIPE_WEBHOOK_SECRET`. Redeploy.
3. **Test purchase:** on the live site, buy a piece with card
   `4242 4242 4242 4242`, any future expiry/CVC, any AU address. Confirm:
   piece shows **Sold** on the site within seconds, order appears in
   `/admin/orders`, webhook shows a green ✓ delivery in Stripe.
4. **Go live:** flip Stripe to live mode (requires Stripe's business
   activation — sole trader ABN is fine), then repeat 1–2 in live mode:
   `sk_live_...` replaces the test key, and a *new* webhook endpoint created
   in live mode provides the live `whsec_...`. Redeploy.
5. Extras: Settings → Emails → enable **Successful payments** (buyer
   receipts), and install the **Stripe mobile app** for sale notifications.

## 4. Resend (optional "you sold something" email)

Skippable — orders always land in `/admin/orders`, and the Stripe app pushes
notifications. For the email:

1. Sign up at resend.com (free tier: 100 emails/day).
2. **Domains → Add Domain → leepottery.com.au** → add the SPF/DKIM DNS
   records it shows at your DNS host → wait for **Verified**.
3. **API Keys → Create** → copy `re_...` → Vercel env var `RESEND_API_KEY`.
   Redeploy.
4. Defaults already fit: to `richard@leepottery.com.au`, from
   `orders@leepottery.com.au` (no mailbox needed for the from-address, just
   the verified domain). Override with `ORDER_NOTIFY_TO` /
   `ORDER_NOTIFY_FROM` if desired.

## 5. Vercel Pro (before real sales)

Vercel's Hobby plan prohibits commercial use — the shop needs Pro
(US$20/month) once real payments flow.

1. Pro plans live on a team: avatar menu → **Create Team** → choose Pro.
2. Project → Settings → General → **Transfer Project** → the new team.
   Env vars, domains, and deployments transfer with it.
3. Timing: flip this when Stripe goes live — no need to pay during test-mode
   setup.

---

## Final check

1. `/admin` shows no database banner
2. Admin login works on the phone
3. Test-mode purchase marks the piece sold + logs the order + green webhook ✓
4. Live key + live webhook set, redeployed
5. Pro plan active
6. Replace the placeholder pieces via `/admin` — and you're trading.
