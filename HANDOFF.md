# FlipLocker, Session Handoff & Status

Last updated: 2026-07-20. This doc is the pickup point for a new session. Read it first for full context.

## UNMERGED WORK, read this first

Branch **`claude/continuation-jyy1qz`** (pushed to origin, NOT yet merged to main, no PR open) carries two completed, verified changes that are not live until merged and deployed:

1. **Demo-data production gating + real admin from secrets** (`web/src/lib/demo.ts`, both seed scripts). SEED_DEMO on/off; unset = on until ADMIN_EMAIL+ADMIN_PASSWORD are set, then auto-off with teardown of demo accounts/deals on the next deploy. Verified end to end against a local Postgres. Details in section 3 below.
2. **Mobile overflow fixes.** Deal-detail headers (all four portals) now wrap instead of forcing horizontal scroll on narrow phones; admin Deals/Users tables scroll inside their card instead of clipping columns (`overflow-hidden` -> `overflow-x-auto`). Verified with `web/e2e/mobile-overflow-scan.mjs` (new, committed): logs in as all four demo roles, renders every route including all nine deal states at 360/375/390px, fails on real overflow. 0 bad / 156 checks.

**First action for a new session:** merge this branch to main (client-facing mobile bug is fixed on it) unless the user says otherwise, then continue any new work from main.

Likely next build items discussed with the client (Phase 2, not yet started): member subscriptions (recurring billing; `User.plan` + fee tiers already exist), open single-use offer links (first-buyer-to-pay wins + public trust page + waitlist), fee engine v2 (bracket handling fees, insurance formula, processor pass-through line), Cabrella shipping/insurance adapter (their API V2 supports labels + insurance; follow the existing `shipping.ts` simulator/easypost adapter pattern), live counters, seller profiles, dispute evidence export.

---

## Live site

- Production URL: **https://fliplocker.vercel.app** (always use this, never the `...-hash-...` preview URLs, which are old immutable builds).
- Hosted on Vercel. **Root Directory = `web`** in Vercel settings (the Next.js app lives in `web/`).
- Every push to `main` auto-deploys and re-provisions the database in the build: `prisma migrate deploy` then `tsx prisma/seed.ts` (base config + demo accounts) then `tsx prisma/seed-demo.ts` (9 demo deals). See `web/package.json` `build` script.
- Database: Neon Postgres (connection strings live in Vercel env vars, set by the user).

## Demo logins (password for all: `fliplocker-demo`)

| Role | Email | What they see |
|------|-------|---------------|
| Admin | `admin.demo@fliplocker.app` | All 9 deals, fees & config, users |
| Seller | `seller.demo@fliplocker.app` | Owns all 9 demo deals (fully populated portal) |
| Buyer | `buyer.demo@fliplocker.app` | Buyer side of the 9 deals |
| Hub / Facilitator | `hub.demo@fliplocker.app` | Hub inspection queue |

Note: a **newly self-registered** account starts empty ("No deals yet"). For populated screenshots, log in as `seller.demo@` / `buyer.demo@`, not a fresh account.

## The 9 demo deals

Seeded on every deploy (idempotent: only `DEMO-` deals are wiped and recreated), owned by `seller.demo@` (seller) and `buyer.demo@` (buyer). One per lifecycle state: COMPLETE, DELIVERED_SIGNED, IN_TRANSIT_TO_BUYER, RECEIVED_AT_HUB, IN_TRANSIT_TO_HUB, AWAITING_SELLER_SHIPMENT, PAID, FLAGGED, DECLINED. Source: `web/prisma/seed-demo.ts`.

Card art: 8 front/back image pairs in `web/public/cards/`. The 9th deal reuses the Ohtani art. Send a 9th card's two photos to make all nine distinct.

---

## What was done this session

1. **No em/en dashes** anywhere in site/app content (380+ replaced with commas/colons). Enforced by a guard in `web/scripts/check-copy.mjs` (run `npm run check:copy`).
2. **No pills or eyebrows** above headings: removed the home hero pill and every small-caps kicker above a heading (hero, sections, FAQ, related cards, the "short answer" label).
3. **Brand palette only** (no gold/brown/yellow): recolored the security "limits" callout and all client-facing amber warn states to ink/brand/rose. The only intentional exception is PayPal's own brand-yellow pay button in the sandbox simulator.
4. **Card front + back**: the marketing showcase shows both faces for all 8 cards; the admin deal page shows front/back; every deal-list row (admin overview, admin table, seller & buyer portals) has a card-front thumbnail.
5. **9 demo deals** across the full lifecycle (see above).
6. **Email confirmation** auto-completes in simulator mode (no email provider) so new sellers are not stranded behind an undeliverable link.
7. **Photo uploads** now work on Vercel: stored in Postgres (`upload_blobs` table) because the serverless filesystem is read-only. Served through the signed `/api/media` route.

Merged PRs: #6 (DB self-provision in build), #7 (content + design pass), #8 (email auto-confirm + thumbnails), #9 (Postgres upload storage). Working branch: `claude/news-ticker-mega-menu-g9uwef`.

---

## How the app degrades: "simulator modes"

Every external service runs in a simulator/local mode when its keys are blank, so the app is fully usable with zero third-party setup:

| Service | Real mode trigger | Simulator behavior |
|---------|-------------------|--------------------|
| Email | `RESEND_API_KEY` set | Captured to outbox (not sent); email confirmation auto-completed |
| Payments | `PAYPAL_MODE=sandbox` + creds | In-app sandbox simulator page |
| File storage | `S3_BUCKET` set | Uploads stored in Postgres (`upload_blobs`) |
| Shipping / SMS / news | provider keys set | Simulated / seeded data |

Demo `/public` card media uses a `demo-public:` storage key that `mediaViewUrl` resolves to `/public` (works on read-only serverless FS). See `web/src/lib/storage.ts`.

---

## Pending / recommended before a real client launch

### 1. Real emails (Resend), so confirmations + buyer invitations actually send
1. Create a Resend account, make an API key (`re_...`).
2. Verify a sending domain in Resend (add the DKIM/SPF DNS records it shows).
3. In Vercel env vars set `RESEND_API_KEY` and `EMAIL_FROM` (`FlipLocker <deals@yourverifieddomain.com>`, address must be on the verified domain).
4. Redeploy. Email confirmation and buyer invites become real automatically.

Quick test alternative (no setup): set `DEV_MAILBOX=on` to view captured emails at `/dev/mailbox` and click the links. Turn off before real launch (exposes all captured mail).

### 2. Production file storage (move off the database), before high volume / videos
DB storage is fine for the demo and light use, but hub inspection **videos** will bloat Postgres. Both options auto-switch (the S3 code path already exists, just set env vars):
- **Cloudflare R2 / S3** (zero code change): set `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`. R2 has a free tier with no egress fees.
- **Vercel Blob** (needs a small code adapter): create a Blob store in the Vercel dashboard (auto-adds `BLOB_READ_WRITE_TOKEN`).

### 3. Security hardening (demo data + accounts) — DONE, needs the env set at launch
Implemented in `web/src/lib/demo.ts` (gate) plus `web/prisma/seed.ts` and `web/prisma/seed-demo.ts`. The four shared-password demo accounts + 9 demo deals are now gated, and a real admin is seeded from secrets. To lock down a real launch, set in Vercel env:

- `ADMIN_EMAIL` + `ADMIN_PASSWORD` (and optional `ADMIN_NAME`): seeds a real admin on each deploy (password refreshed from the env, so rotating it takes effect). This alone flips demo data OFF by default.
- Optionally `SEED_DEMO=off` to force it, or `SEED_DEMO=on` to keep the demo data on the hosted sales demo even with a real admin present.

Behavior of the gate (`SEED_DEMO`): `on`/`off` force it; when unset it is ON by default but auto-OFF once `ADMIN_EMAIL`+`ADMIN_PASSWORD` are set. When OFF, the next deploy also tears down any demo accounts/deals that already exist (deals first, then accounts, FK-safe). Base config (checkout + FREE/PRO fees) is always seeded regardless. The current hosted demo has none of these env vars set, so it keeps its demo data unchanged.

### 4. Custom domain (optional)
- Add your domain in Vercel, then update `APP_URL` so email/invite links point at it.

---

## Dev-only tooling (keep OFF in production)

- `DEV_MAILBOX=on` -> `/dev/mailbox` shows captured emails.
- `DEV_CONTROLS=on` -> staging simulator buttons (advance carrier/timers) on deal pages.

---

## Resuming in a new session

The repo is cloned from `main`, which has all of the above. Start by reading this file. Common local dev loop (from `web/`):

```
# Postgres + env are needed for DB-backed pages; the marketing site renders without them.
npm run dev            # http://localhost:3000
npm run check:copy     # dash + compliance guard
npm run lint && npx tsc --noEmit
npm run db:seed && npm run seed:demo   # base config + demo accounts + 9 demo deals
```
