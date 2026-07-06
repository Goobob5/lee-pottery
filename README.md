# Lee Pottery — website

Next.js implementation of the Lee Pottery site, built from the Claude Design
handoff bundle at the repo root (see `../README.md`, `../chats/`, `../project/`).

## Stack

- **Next.js 16** (App Router, TypeScript, CSS Modules — no UI framework)
- **Stripe Checkout** for real payment (hosted, redirect-based)
- **Formspree** for the Enquire form (no backend email server needed)
- Cart persists to `localStorage`; the piece detail view is a client-side
  modal overlay rather than a separate page, matching the design.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the two values below
npm run dev
```

### Required environment variables

| Variable | Where to get it | What breaks without it |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | [Stripe dashboard → API keys](https://dashboard.stripe.com/apikeys). Use a `sk_test_...` key while developing. | The Cart "Check out" button shows a clear setup error instead of redirecting to Stripe. |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Create a form at [formspree.io](https://formspree.io), copy its endpoint (`https://formspree.io/f/xxxxxxx`). | The Enquire form shows a clear setup error instead of sending. |

Both features fail closed with a visible, honest error message rather than
silently pretending to succeed — safe to deploy before either is configured.

## Content still needed

The catalog in `src/lib/products.ts` is a placeholder range (names, prices,
descriptions) carried over from the design prototype. Five products, the
studio-wide photo, and Richard's avatar already have real photos (pulled from
the design session); the rest render as labeled "Photo coming soon" frames:

- Swap placeholder products/prices for the real range in `src/lib/products.ts`
  and drop photos into `public/images/products/`.
- Two process photos on the Artist page (`Thrown`, `Fired`) were dropped as
  placeholders on purpose: the uploaded "thrown" and "drawn" photos in the
  design file were byte-identical duplicates, and the uploaded "fired" photo
  was unrelated (a plate of food, not a kiln shot). Add real photos to
  `public/images/studio/` and wire them back into `src/app/artist/page.tsx`.
- The Instagram grid on the homepage links out to
  `instagram.com/lee.pottery.sydney` but has no real post thumbnails yet.
- Market schedule dates in `src/app/page.tsx` (`SCHEDULE`) are best guesses
  from the design session — confirm the real Kirribilli cadence.

## Known simplifications (flagged, not silently shipped)

- **Inventory isn't locked server-side.** One-of-a-kind pieces are marked
  `sold` in the static catalog; there's no database, so two buyers could
  theoretically both reach Stripe checkout for the same piece before you
  update the catalog. Fine for genuinely low-volume sales; if that becomes a
  problem, the next step is a real database + a Stripe webhook that flips
  `sold: true` on `checkout.session.completed`.
- **Stripe Checkout collects shipping address and card details itself**
  (hosted, PCI-compliant) — there's no custom checkout form in this app,
  unlike the design prototype's mocked one.
- Product images aren't passed to Stripe Checkout line items (would need a
  publicly reachable HTTPS URL, which only exists once this is deployed).

## Deploying

Built against Vercel's zero-config Next.js support: push to a Git repo, import
into Vercel, and set the two environment variables above in the project
settings.
