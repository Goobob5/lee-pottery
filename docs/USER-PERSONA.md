# Lee Pottery — use case & user persona

> Reference document for planning new features and adjustments. Everything here
> is drawn from the repo's history, docs (README, `GO-LIVE.md`, `PHASE-2-PLAN.md`),
> and the site content itself — it describes how the product is actually used,
> not an aspiration. Read this before proposing new work.

## The one-line use case

A solo Sydney ceramicist sells one-of-a-kind and small-batch stoneware through
two channels — his website (`leepottery.com.au`) and in-person market stalls —
and runs the entire operation **from his phone**, with no computer, no design
tools, and no code changes.

## Primary persona: Richard Lee (owner, operator, and the only admin)

**Who he is.** Richard is a ceramicist working from a small studio in Sydney, a
short walk from the water. His work is sculpture and tableware drawn from the
harbour and its estuaries — swans, crocodiles, mangroves, cobalt brushwork on
speckled stoneware. Nothing is mass-produced; most pieces are one of a kind,
with occasional small batches (e.g. a run of six mugs).

**How he sells.**

- **Markets** are the anchor: Kirribilli Markets (Bradfield Park, Milsons
  Point) every fourth Saturday, plus larger events like the Big Design Market.
  When a piece sells at a stall, it must come off the website within seconds —
  hence the phone-first `/admin` "Sold at market" button.
- **Online** via Stripe Checkout, flat $25 shipping, with 30-minute holds on
  one-of-a-kind pieces so two buyers can't pay for the same piece. Volume is
  low — race conditions on batch stock are accepted and resolved by refund.
- **Instagram** (`instagram.com/lee.pottery.sydney`) feeds the audience; the
  Enquire form catches commission requests and "can you throw me a cousin of
  the sold one" conversations.

**His device and technical comfort.**

- Everything operational happens on a **Samsung Galaxy S24+**. Photos are shot
  on the phone in a lightbox; listings are created at `/admin/new-piece` from
  the phone; stock is managed from the phone at the market stall.
- He is **not a developer**. He does not use GIMP, does not commit to the repo,
  and does not open a terminal. The go-live checklist is written click-by-click
  for a browser because that is the right altitude. He builds the site by
  directing Claude sessions (phased handoff docs in `docs/` are written for
  fresh Claude sessions, not for him).
- Phone keyboard **dictation stands in for voice notes** — he speaks a sentence
  about a piece rather than typing paragraphs. Don't build audio handling.
- One admin, one password, a password manager. There will never be a second
  staff account, roles, or permissions.

**What he cares about (established values — don't relitigate).**

1. **His voice is the product's voice.** Listing copy is dry, warm, first
   person, full of Sydney-harbour references, never salesy — the `note` field
   is signed "Richard" on the site. AI may draft it, but only in that voice.
2. **Review before publish, always.** He chose "Automate everything, I edit
   drafts." Nothing goes live without passing through his eyes. Never
   auto-publish.
3. **Honest failure modes.** Every unconfigured or broken feature fails closed
   with a visible, plain-language error — never silently pretends to work.
4. **Low-volume pragmatism.** This is one person selling dozens of pieces, not
   a store selling thousands. Complexity is only worth it when it removes a
   real chore (the listing pipeline) — not for theoretical scale problems.

**His main pain point (largely solved, keep it solved).** Listing a new piece
used to mean a computer, image editing, and repo commits. The Phase 2 pipeline
collapsed that to: shoot in the lightbox following the `/admin/shoot` SOP,
upload the raws, type dims/weight/price and one sentence, review Claude's
drafted fields, publish. Any new feature that reintroduces a desktop-only or
code-editing step is a regression.

## Secondary persona: the buyer

Buyers are people who value handmade, one-of-a-kind ceramics with a story —
Sydney locals who meet Richard at a market stall, Instagram followers, and
gift-buyers. They buy single pieces at $140–$540, they read the personal note
on each listing, and they may enquire about commissions or "a cousin" of a
sold piece. They expect: to see clearly whether a piece is still available, a
simple hosted checkout (Stripe collects card and address), and a human reply
via the Enquire form. They are browsing on phones as often as not — the site
is mobile-first by deliberate refinement.

## The system in one paragraph (for orientation)

Next.js 16 on Vercel, Postgres (Neon) as the single source of truth for
catalog and stock, Stripe Checkout + webhook for online sales, Vercel Blob for
phone-uploaded photos, `sharp` for server-side image processing, Claude
(Anthropic API) for drafting listing copy, Formspree for enquiries, optional
Resend for sale notifications. `/admin` is the phone-first workbench: stock
control, listing pipeline, photoshoot SOP, order log.

## Implications for new features

- **Phone-first is a hard constraint.** Every admin flow must work one-handed
  on a Galaxy S24+, possibly on market-day mobile data.
- **Seconds matter at the stall**, not milliseconds online. Optimise the
  market-day loop (sell, un-sell, adjust stock) before anything else.
- **Prefer removing steps over adding options.** Richard wants fewer chores,
  not more dashboards or settings.
- **Keep the fail-closed contract.** New integrations must degrade to a
  visible, honest error, never a silent no-op.
- **Anything AI-drafted stays behind his review**, and must be written in his
  voice using real catalog entries as few-shot examples.
- **Known deferred work** (Phase 3 candidates already flagged): real shipping
  price bands, free market-pickup option, batch-stock checkout holds if volume
  ever justifies it, real Instagram thumbnails, confirmed market schedule
  dates, real process photos on the Artist page.
