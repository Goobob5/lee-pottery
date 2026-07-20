# Lee Pottery — website

> **New here, or confused by "Phase 1/2/3"?** Start with
> [`docs/OVERVIEW.md`](docs/OVERVIEW.md) — it maps your real-world process
> against the website, explains what the phases mean, and shows what's built
> vs. live vs. still-placeholder.

Next.js implementation of the Lee Pottery site, built from the Claude Design
handoff bundle at the repo root (see `../README.md`, `../chats/`, `../project/`).

## Stack

- **Next.js 16** (App Router, TypeScript, CSS Modules — no UI framework)
- **Stripe Checkout** for payment (hosted, redirect-based) + a **Stripe
  webhook** that takes pieces off the shelf the moment they sell
- **Postgres** (free [Neon](https://neon.tech) tier in production, any
  Postgres in dev) as the single source of truth for catalog and stock;
  schema is created and seeded automatically on first use
- **Admin workbench** at `/admin` — phone-first stock control ("Sold at
  market"), product editing, order log, and the interactive photoshoot-day
  SOP at `/admin/shoot`
- **Formspree** for the Enquire form (no backend email server needed)
- **Resend** (optional) for "you sold something" notification emails
- Cart persists to `localStorage`; the piece detail view is a client-side
  modal overlay rather than a separate page, matching the design.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in values — see the table below
npm run dev
```

### Environment variables

| Variable | Where to get it | What breaks without it |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | [Stripe dashboard → API keys](https://dashboard.stripe.com/apikeys). Use a `sk_test_...` key while developing. | The Cart "Check out" button shows a clear setup error instead of redirecting to Stripe. |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks. Point an endpoint at `/api/stripe-webhook` with events `checkout.session.completed` + `checkout.session.expired`; copy its signing secret. (`stripe listen --forward-to localhost:3000/api/stripe-webhook` in dev.) | Sales don't mark pieces sold automatically and no order lands in `/admin/orders`. |
| `DATABASE_URL` | A [Neon](https://neon.tech) free-tier database's pooled connection string (or any Postgres). Tables + starting catalog are created automatically. | Site serves the static placeholder catalog from `src/lib/products.ts`; admin stock control is disabled. |
| `ADMIN_PASSWORD` | Make one up — long and random. | `/admin` can't be logged into. |
| `BLOB_READ_WRITE_TOKEN` | A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store's read-write token (added automatically when you create a Blob store in the Vercel project). | Phone uploads at `/admin/new-piece` are written to `public/uploads/` on the running machine instead of Blob — fine locally, not in production. |
| `ANTHROPIC_API_KEY` (optional) | [console.anthropic.com](https://console.anthropic.com). | The listing pipeline still processes and attaches photos, but the fields come up empty instead of being drafted in your voice. |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Create a form at [formspree.io](https://formspree.io), copy its endpoint. | The Enquire form shows a clear setup error instead of sending. |
| `RESEND_API_KEY` (optional) | [resend.com](https://resend.com), with the sending domain verified. Also see `ORDER_NOTIFY_TO` / `ORDER_NOTIFY_FROM` in `.env.example`. | No email nudge on a sale — orders still appear in `/admin/orders` and Stripe. |

Every feature fails closed with a visible, honest error message rather than
silently pretending to succeed — safe to deploy before everything is configured.

## How selling works

- **Catalog**: products live in Postgres (`products` table). Without
  `DATABASE_URL` the site falls back to the placeholder catalog in
  `src/lib/products.ts` so it still renders end-to-end.
- **Online sale**: checkout re-checks price + availability server-side,
  puts a ~30-minute hold on one-of-a-kind pieces (so two buyers can't both
  pay for the same piece), and the Stripe webhook decrements stock, records
  the order, and emails Richard when payment lands. Webhook retries are
  idempotent (keyed on the Stripe session id).
- **Market-day sale**: `/admin` on the phone → tap **Sold at market** → the
  piece is off the website in seconds. Batch pieces get `+1 / −1` stock
  buttons; mistakes get **Back on the shelf**.
- **One-off vs batch vs repeatable**: `oneOfAKind` pieces have stock 0/1 and
  get checkout holds; batch/repeatable pieces are quantity-tracked and sell
  off one representative photo set.

## Admin (`/admin`)

Single password (`ADMIN_PASSWORD`), 30-day signed session cookie. Pages:

- **Pieces** — stock control + edit/add/delete listings
- **Add a piece** (`/admin/new-piece`) — the phone-first listing pipeline:
  upload the raw shots, type the measurements and one sentence, and the server
  crops/levels/resizes them and (with `ANTHROPIC_API_KEY`) drafts every field
  in Richard's voice. Review the prefilled form, set the price, publish.
  Nothing goes live without review.
- **Photoshoot day** (`/admin/shoot`) — interactive end-to-end SOP for
  shooting and publishing pieces; progress persists on the phone
- **Orders** — online orders as recorded by the webhook

## Content still needed

The catalog seed in `src/lib/products.ts` is a placeholder range (names,
prices, descriptions) carried over from the design prototype. Five products,
the studio-wide photo, and Richard's avatar already have real photos; the
rest render as labeled "Photo coming soon" frames:

- Replace placeholder pieces via `/admin` (or edit `src/lib/products.ts`
  before first seeding) and drop photos into `public/images/products/`.
- Two process photos on the Artist page (`Thrown`, `Fired`) were dropped as
  placeholders on purpose: the uploaded "thrown" and "drawn" photos in the
  design file were byte-identical duplicates, and the uploaded "fired" photo
  was unrelated (a plate of food, not a kiln shot). Add real photos to
  `public/images/studio/` and wire them back into
  `src/app/(site)/artist/page.tsx`.
- The Instagram grid on the homepage links out to
  `instagram.com/lee.pottery.sydney` but has no real post thumbnails yet.
- Market schedule dates in `src/lib/schedule.ts` are best guesses from the
  design session — confirm the real Kirribilli cadence.

## Known simplifications (flagged, not silently shipped)

- **Batch stock isn't held during checkout** — only one-of-a-kind pieces get
  the 30-minute hold. Two buyers racing for the last swan mug is possible
  and resolved by a refund; at this volume it isn't worth the complexity.
- **Product photos** come from Vercel Blob (uploaded at `/admin/new-piece`) or,
  for the seed catalog, repo files under `public/images/products/`. The database
  stores whichever URL/path applies and the site renders both — remote Blob URLs
  are allow-listed for `next/image` in `next.config.ts`.
- **Shipping** is offered at checkout as two Stripe `shipping_options`: free
  local pickup (arranged by email — studio in Rosebery, home in Surry Hills, or
  the next market) and a **flat $25** shipped rate (`SHIPPING_CENTS` in
  `src/app/api/checkout/route.ts`). The buyer's choice is recorded on the order
  (`/admin/orders`, the notification email, and the confirmation page). Priced
  per-size bands remain a deferred simplification — the shipped rate is flat.
- **Stripe Checkout collects shipping address and card details itself**
  (hosted, PCI-compliant) — there's no custom checkout form in this app.

## Deploying

Built against Vercel's zero-config Next.js support: push to a Git repo,
import into Vercel, and set the environment variables above in the project
settings. Note Vercel's Hobby plan doesn't allow commercial use — the shop
needs the Pro plan. First deploy with `DATABASE_URL` set creates and seeds
the schema automatically; then log into `/admin` and replace the placeholder
catalog.
