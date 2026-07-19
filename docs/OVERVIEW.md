# Start here — how the pieces fit together

If "Phase 1 / 2 / 3" has ever felt tangled, this page is the untangle. Read it
first; every other doc is a detail under one of the headings below.

## The one thing to get straight

**"Phase 1/2/3" is the order the *website software* was built in.** That's all
it is. It is **not** the stages of your pottery process, and it is **not** the
steps to switch the shop on.

Three separate tracks get called "the same thing" and then feel confusing:

- **Build** — writing the software. This is what "Phase 1/2/3" numbers.
- **Go-live** — the one-time browser setup that switches a built feature on
  (Stripe, database, passwords, Pro plan). See `GO-LIVE.md`.
- **Content** — replacing the placeholder pieces with your real catalogue.

A feature can be **built** but not yet **live** and not yet **filled with real
pieces**. All three are true right now. That's normal — they move at their own
pace.

## Two subjects, not one

Almost every sentence about this project is really about one of two things.
Keeping them apart is most of the clarity:

- **Your process** — how you actually work in the real world:
  make → shoot → list → sell → ship.
- **The website** — the software. Two halves: the **shop** (what customers
  see) and the **workbench** at `/admin` (what only you see).

Here is the same story told across both, phase by phase.

| | Your real-world process | The website (software) | Status |
|---|---|---|---|
| **Before all this** | Make pieces, sell at market by hand | A brochure site — nice to look at, no shop, no admin | — |
| **Phase 1** — the shop & the workbench | Sell online *and* at market; take a piece off the shelf from your phone the moment it sells | Catalogue lives in a database; Stripe checkout; a webhook auto-marks pieces sold; `/admin` for stock control, an orders log, and the photoshoot SOP | ✅ built, merged to `main` |
| **Phase 2** — the listing pipeline | List a piece with **no computer, no photo editor, no code**: shoot on the phone, upload, review the draft, publish | `/admin/new-piece`: phone upload → server crops/levels/resizes the photos → Claude drafts every field in your voice → you review, set the price, publish. Nothing goes live without your review | ✅ built, merged to `main` |
| **Phase 3** — shipping & fulfilment | Offer real shipping choices (price by size/weight, free market pickup); keep track of what you've posted | Shipping price bands replace the flat $25; fulfilment (mark shipped, tracking email); policy pages; Instagram grid; exhibition stories | ⛔ not built yet — future work |

Two things sit **outside** the phase numbers on purpose:

- **Go-live** (`GO-LIVE.md`) — the software for Phases 1 and 2 is finished, but
  the shop is **not trading yet**. It needs a one-time, click-by-click setup:
  Neon database, admin password, Stripe keys + webhook, Vercel Pro. That's a
  checklist you do in a browser — no code, and not a "phase."
- **Content** — the catalogue is still the placeholder range carried over from
  the design prototype. Real pieces get added through `/admin` (Phase 2 makes
  that a phone job). A couple of process photos on the Artist page are still
  missing on purpose (see the README's "Content still needed").

## Where things stand right now (July 2026)

- **Built:** Phase 1 + Phase 2 — done and merged to `main`.
- **Live:** not yet. The shop won't take a payment until the `GO-LIVE.md`
  checklist is done (database, Stripe, password, Pro plan).
- **Content:** still the placeholder catalogue. Swap it for real pieces via
  `/admin` before real payments flow.
- **Next:** Phase 3 (shipping bands + fulfilment) — not started; scoped in
  `PHASE-2-PLAN.md` under "Out of scope (Phase 3+)."

So, in one sentence: **the software you need to start selling is finished; the
shop just hasn't been switched on or stocked with real pieces yet, and the
shipping/fulfilment polish is deliberately left for later.**

## Which doc answers which question

| You want to… | Read |
|---|---|
| Understand the whole shape (you are here) | this file |
| Switch the shop on and start trading | `GO-LIVE.md` |
| Know how a shoot becomes a live listing | the SOP at `/admin/shoot`, and the README |
| See how the code is put together / run it locally | `README.md` |
| Understand what Phase 2 built and why | `PHASE-2-PLAN.md` |
