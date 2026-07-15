# FlipLocker — web app

Next.js 15 (App Router) + TypeScript · Prisma + PostgreSQL · Tailwind.

Implements the **complete deal lifecycle** end-to-end — seller create → buyer
pay → seller ship → hub verify → deliver → fund release → complete — across four
role portals (seller, buyer, hub facilitator, admin), plus a conversion-focused
marketing site. Every external service (payments, shipping, SMS, email, media
storage) sits behind an adapter with a **simulator mode**, so the whole flow is
demoable with zero third-party credentials and flips to the real provider via
env vars — no code change.

## Brand — "Bold Blue" sports-tech identity

- **Palette:** brand blue `#0B6CFF` (ramp 50–950, accent `#1B75FF`, deep
  `#0757D6`), navy depth `#09203F`/`#050E1D`, cool ink neutrals (page `#F7F8FA`,
  borders `#E3E7EE`, text `#0B1220`), win-green `#16A34A` for payout states. All
  defined as Tailwind theme tokens in `src/app/globals.css`.
- **Type:** Archivo (display/headlines/money), Inter (UI/body), Barlow Condensed
  (uppercase `.kicker` ticker labels — the signature sportsbook detail),
  JetBrains Mono (money/certs/tracking). Loaded via `next/font`.
- **Logo:** the client-provided shield mark at
  `public/brand/fliplocker-logo.svg` (a two-blue crest with an "F" + check),
  rendered by `LockMark`/`AppIcon` in `src/components/brand.tsx`; `Wordmark`
  keeps the FLIP/LOCKER text (light + dark); favicon at `src/app/icon.svg`.

### Card photos

Real card photos live in `public/cards/{slug}.jpg` (front) and
`public/cards/{slug}-back.jpg` (back) — e.g. `griffey.jpg` + `griffey-back.jpg`.
The demo roster (`prisma/seed-demo.ts`) seeds both a `FRONT_PHOTO` and a
`REAR_PHOTO` per deal so the deal pages document front and back; the marketing
showcase (`src/lib/marketing.ts`) shows the front. The seed copies each into
local media storage so the signed-URL flow renders it exactly like a seller
upload. **To change a card image, drop a new photo at `public/cards/{slug}.jpg`
or `{slug}-back.jpg` — no code changes.** (Source images were resized with
`sharp`.)

## Run staging

```bash
cd web
npm install
cp .env.example .env                       # defaults work for local staging
npx prisma migrate dev                      # apply schema to DATABASE_URL
npm run db:seed                             # config + FREE/PRO fees + demo accounts
DEV_CONTROLS=on DEV_MAILBOX=on npm run build
DEV_CONTROLS=on DEV_MAILBOX=on npm start    # or: npm run dev
```

Demo accounts (password `fliplocker-demo`): `seller.demo@fliplocker.app`,
`buyer.demo@fliplocker.app`, `hub.demo@fliplocker.app`, `admin.demo@fliplocker.app`.

`DEV_CONTROLS=on` shows staging buttons that simulate carrier scans and timer
expiry (real deployments get these from carrier webhooks + the cron job).
`DEV_MAILBOX=on` exposes captured email/SMS at `/dev/mailbox`.

## The lifecycle (and where it lives)

| Stage | Who | Route | State |
|---|---|---|---|
| Create deal, invite buyer | Seller | `/seller/deals/new` | `CREATED → BUYER_NOTIFIED` |
| Claim invite, review, Accept & Pay | Buyer | `/invite/[token]`, `/buyer/deals/[id]` | `ACCEPTED → PAID` |
| ToS gate + Leg 1 label to hub | Seller | `/seller/deals/[id]` | `AWAITING_SELLER_SHIPMENT` |
| Carrier → hub | (carrier/sim) | — | `IN_TRANSIT_TO_HUB → RECEIVED_AT_HUB` |
| Check-in, video + 2 photos + tamper seal, Pass/Fail | Facilitator | `/hub`, `/hub/deals/[id]` | `VERIFIED` or `FLAGGED` |
| Repack + Leg 2 (signature, never waived) | Facilitator | `/hub/deals/[id]` | `REPACKED → IN_TRANSIT_TO_BUYER` |
| Delivered & signed; 48h review | (carrier/sim) → Buyer | `/buyer/deals/[id]` | `DELIVERED_SIGNED` |
| Approve / auto-complete → payout + fee released | Buyer / timer | — | `FUNDS_RELEASED → COMPLETE` |

Exception paths: buyer **Decline**, 72-hour **ship-timeout** auto-cancel+refund,
hub **Fail** → `FLAGGED` + auto-refund, buyer **Report Issue** → `FLAGGED` for
admin, admin manual **cancel/refund/regenerate-label/release**. Every transition
is guarded server-side and appended to `deal_events` (the transparency timeline).

Two browser walkthroughs in `e2e/` drive this whole path against the real app.

## Configuration (never hardcoded)

All money/logistics numbers live in DB config, editable in **Admin → Fees &
config** with no code change:

- `fee_config` (per plan FREE/PRO): flat **floor** below a **crossover price**,
  **percent (bps)** at/above it, **who pays** (BUYER/SELLER/SPLIT). Fee is a
  function of **sale price only** — comp/market value is never collected and has
  no column.
- `checkout_config`: min price, outbound shipping & signature line, insurance
  ($/started-$100 pass-through), seller label charge, tax enable/default +
  per-state `tax_rates`, hub ship-to address, ship-timer + review-window hours,
  media-purge days.

Seed values mirror the client's calculator (Free 4%/$10, Pro 2%/$5, min $160,
shipping $9.50, insurance $0.50/$100) — placeholders until final numbers are set.

## Service modes (all default to simulator)

| Service | Env | simulator (default) | real |
|---|---|---|---|
| Payments | `PAYPAL_MODE` | local approval page, records identical | `sandbox`/`live` PayPal Orders v2 multiparty (`platform_fees`, DELAYED disbursement) |
| Shipping | `SHIPPING_MODE` | USPS-style tracking + rendered labels at `/labels/[id]` | `easypost` (`EASYPOST_API_KEY`), signature on Leg 2 |
| Email | `RESEND_API_KEY` | captured in `email_outbox` → `/dev/mailbox` | Resend |
| SMS | `TWILIO_*` | captured in `sms_outbox` → `/dev/mailbox` | Twilio |
| Media | `S3_BUCKET` | local `.data/uploads`, signed view URLs | S3 presigned PUT/GET |

Funds are always held by the payment processor; FlipLocker's account receives
only its service fee.

## Jobs

`POST /api/jobs/tick` (bearer `CRON_SECRET`) processes due timers: 72h ship
auto-cancel+refund, 48h review auto-complete+release, and 30-day hub-media purge.
Point Vercel Cron / any scheduler at it.

## Guardrails & tests

- `npm run test` — 24 Vitest unit tests (fee engine, quote math, state machine).
- `npm run check:copy` — fails if forbidden terminology appears in `src/` or
  `prisma/` (see `docs/COMPLIANCE-NOTES.md`; funds are "held securely by our
  payment processor").
- `npm run typecheck` / `npm run lint`.
- CI (`.github/workflows/ci.yml`) runs all of the above + a production build.
- Security: role + ownership authz on every action/route, rate limiting on auth
  and uploads, signed-URL-only media, PayPal webhook signature verification,
  baseline security headers.
- No public marketplace surface: deals are reachable only by owner, bound buyer,
  or invite token. No browse/search/listing route exists.
