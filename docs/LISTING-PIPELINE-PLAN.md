# The listing pipeline — build plan

> Handoff plan for a fresh Claude session. Written 2026-07-11, immediately after
> the shop shipped (PR #8, branch `claude/lee-pottery-ecommerce-e20o8p`). Read
> this whole file, then AGENTS.md, before writing code. (The shop and this
> pipeline were originally called Phase 1 and Phase 2 — see `OVERVIEW.md`.)

## Goal

Kill the listing headache. Richard shoots pieces on his Galaxy S24+ in a
lightbox (the SOP at `/admin/shoot` produces ~5 raw photos + measurements +
a spoken/typed sentence per piece). The listing pipeline turns that raw
material into a published listing **from the phone, with no computer, no GIMP,
and no repo commits**:

1. `/admin/new-piece`: upload the raw photos, type dims/weight/price and one
   sentence about the piece (phone keyboard dictation covers "voice notes" —
   don't build audio handling).
2. Server processes the images automatically (crop/level/resize/WebP).
3. Claude drafts every listing field from the photos + facts, **in Richard's
   voice**.
4. Review screen (prefilled `ProductForm`) — Richard edits anything, hits
   publish. Done: the piece is live with photos.

The user chose "Automate everything, I edit drafts" — AI may draft all fields
including the personal note, but everything passes through his review before
publish. Never auto-publish.

## What already exists (the shop — read these files first)

| Thing | Where |
|---|---|
| Postgres catalog, auto-migrating schema, seed | `src/lib/db.ts` (`ensureSchema`, `products` table has `image` + `photos` columns — currently repo paths like `/images/products/x.webp`) |
| Catalog read + static fallback | `src/lib/catalog.ts` (falls back to `src/lib/products.ts` when no `DATABASE_URL`) |
| Admin auth (single password, signed cookie) | `src/lib/admin-auth.ts` — call `requireAdmin()` in every new page/action/route |
| Server actions incl. `saveProductAction` | `src/lib/admin-actions.ts` |
| Admin UI + shared styles | `src/app/admin/(dash)/*`, `src/app/admin/admin.module.css` |
| Product create/edit form | `src/app/admin/(dash)/products/ProductForm.tsx` — the review screen should reuse/extend this |
| Photoshoot SOP | `src/app/admin/(dash)/shoot/ShootChecklist.tsx` — update its wrap-up steps once upload exists (they currently say "drop files into the repo / the listing pipeline will automate this") |
| Env var docs | `.env.example`, README |

## Architecture decisions (made — don't relitigate)

1. **Image storage: Vercel Blob** (`@vercel/blob`). Repo-file photos stop
   scaling the moment uploads come from a phone. DB `image`/`photos` columns
   already store strings — they'll now hold full Blob URLs. Existing
   repo-path entries (`/images/products/...`) must keep working: treat any
   value starting with `/` as a local public path, anything `https://` as
   remote. Add `images.remotePatterns` for `*.public.blob.vercel-storage.com`
   in `next.config.ts` so `next/image` accepts them.
2. **Uploads go client → Blob directly** using `@vercel/blob/client`
   (`upload()` in the browser + a `handleUpload` route at
   `/api/blob-upload`). Raw S24+ photos are 5–15 MB and Vercel's serverless
   request body limit is ~4.5 MB, so routing files through a server action
   will break. The `handleUpload` route MUST check `requireAdmin()`/the
   session cookie before issuing tokens — it mints upload credentials.
3. **Image processing: `sharp`** in a route handler (`/api/process-piece` or
   similar): fetch the raw blobs, then per photo — `rotate()` (EXIF),
   `normalise()` for levels, `trim()` cautiously or fixed center crop with
   margin, resize to 2000px longest edge, WebP quality ~82, plus a 400px
   thumbnail. Store processed versions in Blob under `products/<slug>/…`,
   keep the raws under `raw/<date>/…` (they're the backup for one-offs).
   Grey-card white balance: v1 is `normalise()` + Richard's review; a real
   grey-card sampler (user picks the grey frame, compute channel gains) is a
   stretch goal, not a blocker.
4. **AI drafting: Claude API, model `claude-opus-4-8`**, via
   `@anthropic-ai/sdk`, in a server route (needs `ANTHROPIC_API_KEY`).
   - Input: the processed photos as base64 `image` blocks (downscale to
     ~1100px for the API call to keep image tokens down) + the typed facts
     (dims, weight, capacity, price, clay/glaze if given, the one-sentence
     story) + piece kind (one-off / batch / repeatable).
   - **Voice few-shot:** include 3–4 real catalog entries (pull live ones
     from the DB, else the seed in `products.ts`) showing `name`, `meta`,
     `desc`, `note` — the `note` is signed "Richard" on the site and the
     voice (dry, warm, first person, Sydney-harbour references, never
     salesy) must match. Instruct: don't invent facts not visible in the
     photos or given by Richard; leave unknown fields empty rather than
     guessing; flag anything uncertain.
   - Output: use structured outputs — `client.messages.parse()` with
     `output_config: { format: zodOutputFormat(DraftSchema) }` (from
     `@anthropic-ai/sdk/helpers/zod`). Schema fields: `name`, `type` (enum
     from `FILTER_TYPES` minus `All`), `meta`, `dims`, `material`, `desc`,
     `note`, `altTexts` (one per photo), `suggestedHeroIndex` (which photo
     leads). Price is Richard's alone — never draft it.
   - Cost is pennies per listing at this volume; don't add caching
     complexity for it.
5. **Review = prefilled ProductForm.** After processing + drafting, land on
   the existing product form with all fields and photo URLs prefilled
   (extend `ProductForm` to accept draft values + a photo strip with
   drag-to-reorder or simple up/down buttons; hero = first). Publishing goes
   through the existing `saveProductAction` — one write path.
6. **Fail closed, visibly** (repo convention): missing
   `BLOB_READ_WRITE_TOKEN` or `ANTHROPIC_API_KEY` → the new-piece page shows
   a clear setup banner (see the `hasDb()` banner in
   `src/app/admin/(dash)/layout.tsx` for the pattern). If AI drafting fails,
   the flow must still work — land on the form with photos attached and
   fields empty. The pipeline degrades gracefully at every stage.

## Build order

1. `npm install @vercel/blob sharp @anthropic-ai/sdk zod` (sharp is included
   in Vercel's Node runtime natively — just list it in deps).
2. Blob plumbing: `/api/blob-upload` (client-upload token route, admin-gated)
   + `next.config.ts` remotePatterns + render both local and remote photo
   URLs (check `ProductPhoto.tsx` and `PieceGallery.tsx`).
3. `/admin/new-piece` page: multi-photo picker (mobile `<input type="file"
   accept="image/*" multiple>`), facts fields, progress states
   (uploading → processing → drafting → review).
4. `/api/process-piece`: sharp pipeline, returns processed URLs.
5. `/api/draft-listing`: Claude call, returns the draft JSON.
6. Review screen wiring into `ProductForm` + publish.
7. Update the SOP wrap-up steps in `ShootChecklist.tsx` (transfer/edit/upload
   steps collapse into "upload straight from the phone at /admin/new-piece").
8. Update README + `.env.example` (`BLOB_READ_WRITE_TOKEN`,
   `ANTHROPIC_API_KEY`).

## Environment & verification notes (session-tested facts)

- **AGENTS.md is serious**: Next 16 differs from training data — read
  `node_modules/next/dist/docs/` (route handlers, server actions, async
  `cookies()`/`params`). This repo does NOT enable `cacheComponents`; all
  routes are `force-dynamic` via the root layout.
- Local Postgres 16 exists in the dev container:
  `service postgresql start`, then
  `DATABASE_URL=postgres://lee:lee@localhost:5432/leepottery` (create role
  `lee`/`lee` + db `leepottery` if the container is fresh). Schema
  auto-creates and seeds on first request.
- End-to-end verification pattern from the shop build: run `npm run dev -- --port
  3111` with env vars, drive it with Playwright (`npm install playwright` in
  the scratchpad, launch with `executablePath: '/opt/pw-browsers/chromium'`
  — do NOT `playwright install`). Kill dev servers with `fuser -k
  3111/tcp`, not `pkill` (pkill's pattern matches your own shell).
- Blob and the Anthropic API can't be fully exercised without tokens. If
  `ANTHROPIC_API_KEY` is available in the session env, do one real drafting
  call; otherwise verify the fail-closed path (clear banner, flow completes
  with empty draft). For Blob, abstract storage behind a small module so a
  local-filesystem fallback (write to `public/uploads/` in dev) makes the
  whole flow testable locally — that fallback is also useful for Richard's
  local dev.
- `npm run lint` and `npm run build` must pass; verify sharp doesn't break
  the build.

## Git / PR

Branch `claude/lee-pottery-ecommerce-e20o8p`; the shop is PR #8.
- If PR #8 is **unmerged**: continue committing on the same branch (the listing
  pipeline extends the same PR) — or ask Richard if he'd rather stack it separately.
- If PR #8 is **merged**: reset the branch from latest main
  (`git fetch origin main && git checkout -B claude/lee-pottery-ecommerce-e20o8p origin/main`),
  build the listing pipeline there, push, open a **new draft PR**.

## Out of scope (shipping & fulfilment, and beyond)

- Shipping price bands + free market-pickup / local-pickup options in Stripe
  Checkout (replace the hardcoded `SHIPPING_CENTS` in
  `src/app/api/checkout/route.ts`).
- Orders fulfilment (mark shipped, tracking email), policies pages.
- Exhibition story pages, Instagram, structured data.
- Audio voice-note transcription (phone dictation is the v1 answer).
- Grey-card-accurate white balance (v1 ships `normalise()` + human review).
