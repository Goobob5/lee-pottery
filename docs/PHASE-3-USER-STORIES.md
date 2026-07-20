# Phase 3 — User stories

> Backlog from the 2026-07-20 review of the site against Shopify's feature
> set, filtered to two goals only: **more sales** and **easier listing**.
> Ordered by expected impact. Each story is written to be buildable on its
> own; acceptance criteria reference the real files they touch.

Personas:

- **Richard** — the maker. Runs everything from his phone; sells online and
  at Kirribilli Markets.
- **Local shopper** — Sydney buyer browsing on mobile, often after meeting
  Richard at the market.
- **Follower** — found a piece via Instagram or word of mouth; may never
  have visited the site before.
- **Past buyer** — has bought before; the most likely person to buy again.

---

## Epic 1 — Shipping options with free market pickup

*Replaces the flat `SHIPPING_CENTS = 2500` in `src/app/api/checkout/route.ts`.*

### 1.1 Free pickup at the market

**As a** local shopper, **I want** to choose "free pickup at Kirribilli
Markets" at checkout **so that** a $25 shipping charge doesn't talk me out
of buying a $45 mug I can collect in person.

Acceptance criteria:

- Stripe Checkout presents at least two shipping choices via
  `shipping_options`: **Pickup at Kirribilli Markets — $0** and **Shipped —
  packed by me, insured** at the current rate.
- The pickup option's description tells the buyer what happens next (which
  market, that Richard will confirm the date by email).
- The order recorded by the webhook (`/admin/orders`) shows which option
  the buyer chose, so Richard knows whether to pack a box or bring the
  piece to the stall.
- A picked-up order does not collect $25; totals in Stripe and on the
  order-confirmed page match what the buyer chose.

### 1.2 Shipping price bands

**As** Richard, **I want** shipping priced by order size instead of a
single flat rate **so that** small purchases aren't scared off and big
ones don't ship at a loss.

Acceptance criteria:

- At minimum two bands (e.g. small ≤ 1 mug-sized piece / standard), with
  the amounts defined in one obvious place — a constant table or env
  vars, not scattered.
- Server-side only: the client never sends shipping amounts (same
  trust rule the checkout route already enforces for prices).
- README's "flat $25" known-simplification note is updated.

---

## Epic 2 — Every piece gets a shareable URL

*Today the piece detail is a modal with no URL — there is nothing to link
to. This epic makes "Instagram story → this exact piece" possible.*

### 2.1 Link directly to a piece

**As** Richard, **I want** every piece to have its own URL **so that** I
can put a link to a specific piece in an Instagram story, bio, or reply to
an enquiry, instead of telling people to "look for the blue one" in the
collection.

Acceptance criteria:

- Each piece is reachable at a stable URL (either a real route like
  `/piece/[slug]` or the collection page with `?piece=slug` — pick one and
  make it canonical).
- Opening that URL cold (new visitor, no prior navigation) shows the piece
  detail with photos, price, and Add to cart — not just the bare grid.
- Opening/closing the modal in normal browsing updates the URL
  (back button closes the detail, share button/copy-link is honest).
- Sold pieces still resolve (shown as sold) rather than 404ing — shared
  links outlive the sale.

### 2.2 Links unfurl with the piece's photo

**As a** follower, **I want** a shared piece link to preview with the
piece's photo, name, and price in Instagram/iMessage/WhatsApp **so that**
the link looks like the piece, not a generic site card.

Acceptance criteria:

- Per-piece `generateMetadata`: title, description, and `og:image` from
  the piece's hero photo (works for both Blob URLs and repo-path images).
- A piece link pasted into a social/chat app unfurls with the correct
  photo and name (verify with an OG debugger or raw fetch of the meta
  tags).

### 2.3 Google can find the pieces

**As** Richard, **I want** individual pieces indexed by Google with
product data **so that** someone searching "handmade ceramic mug Sydney"
can land on a piece and buy it.

Acceptance criteria:

- Product JSON-LD (schema.org `Product` with `offers`: price, currency,
  availability) on each piece URL, generated from live catalog data —
  availability flips when a piece sells.
- `sitemap.ts` lists the collection page and every available piece URL;
  `robots.ts` allows the site and excludes `/admin` and `/api`.
- Structured data passes Google's Rich Results test for at least one
  one-off and one batch piece.

---

## Epic 3 — Stripe checkout quick wins

*Small settings on the existing `stripe.checkout.sessions.create` call in
`src/app/api/checkout/route.ts` — each is roughly a line of code, plus
dashboard checks.*

### 3.1 Promo codes for market shoppers

**As** Richard, **I want** to hand out cards at the stall with a code like
`MARKET10` **so that** browsers at the market become buyers online later.

Acceptance criteria:

- `allow_promotion_codes: true` on the checkout session; the code field
  appears at Stripe Checkout.
- Codes themselves are created/retired in the Stripe dashboard — no admin
  UI built for this.
- A test purchase with an active code shows the discount in the total and
  the recorded order.

### 3.2 Recover abandoned checkouts

**As** Richard, **I want** buyers who bail at checkout to get an automatic
"finish your purchase" email **so that** some fraction of near-misses turn
into sales without me doing anything.

Acceptance criteria:

- `after_expiration: { recovery: { enabled: true } }` on the session;
  Stripe emails a recovery link when a session expires.
- The recovery link path is safe for one-of-a-kind pieces: a revived
  session must re-check availability (the piece may have sold at market in
  the meantime) — a recovered checkout for a sold piece fails cleanly and
  releases nothing it didn't hold.
- Documented in the README so future-Richard knows why buyers get this
  email.

### 3.3 Buyers can opt into news

**As a** past buyer, **I want** a tick-box at checkout to hear about new
pieces **so that** I find out when the next kiln load goes live.

Acceptance criteria:

- `consent_collection: { promotions: 'auto' }` on the session.
- The webhook records the buyer's consent choice with the order, so Epic 4
  can seed its list with actual consenting buyers.

### 3.4 Wallet payments are on

**As a** local shopper on my phone, **I want** to pay with Apple
Pay/Google Pay **so that** buying takes one thumb-press instead of typing
card details.

Acceptance criteria:

- Dashboard task, not code: confirm Apple Pay and Google Pay are enabled
  in Stripe → Settings → Payment methods for the live account.
- A test checkout on a phone shows the wallet button.
- Noted in `docs/GO-LIVE.md` as a checklist item.

### 3.5 Checkout shows the piece's photo

**As a** shopper, **I want** to see the actual piece I'm buying on the
Stripe payment page **so that** I'm confident I'm paying for the right
thing.

Acceptance criteria:

- `product_data.images` is set on each line item using the piece's
  publicly reachable photo URL (Blob URL, or production-origin URL for
  repo-path images).
- Skipped silently for images with no public URL (local dev) — checkout
  must never fail because of a photo.
- README's known-simplification note about images is removed.

---

## Epic 4 — Email list + "new pieces" announcements

*The kiln-opening/drop model: the list hears first, one-offs sell out.
Resend is already wired in (`src/lib/notify.ts`).*

### 4.1 Join the list from the site

**As a** follower, **I want** to leave my email on the site **so that** I
hear when new work goes up, instead of hoping Instagram shows it to me.

Acceptance criteria:

- A one-field signup (email only) on the homepage and/or collection page,
  in keeping with the site's design; honest failure message if the
  backend isn't configured (repo convention: fail closed, visibly).
- Subscribers stored in Postgres (new table via `ensureSchema` in
  `src/lib/db.ts`) with a confirmed/unsubscribed flag and signup date.
- Double-opt-in or at minimum an unsubscribe link in every send (required
  by AU spam law); unsubscribe works without logging in.
- Buyers who ticked the Epic 3.3 consent box appear in the same list.

### 4.2 Announce new pieces to the list

**As** Richard, **I want** to send a "new pieces are up" email from my
phone after publishing a kiln load **so that** the people most likely to
buy see the pieces first.

Acceptance criteria:

- An admin page (behind `requireAdmin()`) that drafts an announcement from
  the N most recently published available pieces: photos, names, prices,
  links (Epic 2's URLs — this story depends on Epic 2).
- Richard reviews/edits before sending — same "nothing goes out without
  review" rule as the listing pipeline. Never auto-send.
- Sends via Resend in batches within free-tier limits; each email has the
  unsubscribe link; the send is recorded (when, to how many) so a
  double-tap doesn't email the list twice.

---

## Epic 5 — Duplicate a piece in admin

*The one listing convenience Shopify has that the pipeline doesn't.*

### 5.1 Relist a repeatable piece in seconds

**As** Richard, **I want** a "Duplicate" button on an existing listing
**so that** when a new kiln load comes out close to a previous batch, I
can copy the old listing and swap photos instead of running the full
new-piece pipeline.

Acceptance criteria:

- A Duplicate action on the piece list and/or edit page
  (`src/app/admin/(dash)/products/`) that opens the product form prefilled
  with everything except stock, marked clearly as a copy (e.g. name
  suffixed "(copy)") — it saves as a **new** piece via the existing
  `saveProductAction`, one write path, never overwriting the original.
- Photos are carried over by default but replaceable via the existing
  photo strip; publishing still requires Richard to review the form —
  nothing goes live in one tap.
- Works on the phone.

---

## Sequencing

| Order | Epic | Why first |
| --- | --- | --- |
| 1 | Epic 1 (pickup + shipping bands) | Biggest conversion lever; already planned as Phase 3 |
| 2 | Epic 2 (piece URLs + OG + sitemap) | Unlocks Instagram → sale; prerequisite for Epic 4.2 |
| 3 | Epic 3 (Stripe quick wins) | Hours of work total, immediate effect |
| 4 | Epic 4 (email list + announcements) | Biggest long-term driver; needs Epic 2 |
| 5 | Epic 5 (duplicate piece) | Nice-to-have listing speedup |
