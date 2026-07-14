# FlipLocker — web app

Next.js 15 (App Router) + TypeScript · Prisma + PostgreSQL · Tailwind. This build covers the
**View Demo milestone**: the core transaction loop (seller → invite → buyer → payment → ship-now
alert) end-to-end.

## Run staging

```bash
cd web
npm install
cp .env.example .env          # then fill in values (defaults work for local staging)
npx prisma migrate dev        # applies schema to DATABASE_URL
npm run db:seed               # checkout config, FREE/PRO fee config, demo accounts
npm run build && npm start    # or: npm run dev
```

Demo accounts seeded (password `fliplocker-demo`): `seller.demo@fliplocker.app`,
`buyer.demo@fliplocker.app`, `admin.demo@fliplocker.app`, `hub.demo@fliplocker.app`.

## Demo script (matches the 7/21 acceptance criteria)

1. **Seller**: register at `/register` → verify email (link lands in `/dev/mailbox` on staging)
   → **Create deal** (card details, front/rear photos, price ≥ configured minimum, buyer email).
2. **Invitation**: buyer invite email is sent on creation (see `/dev/mailbox` when no Resend key).
3. **Buyer**: open the invite link → claim (new account or sign-in) → review photos, details, and
   the itemized checkout → **Accept & Pay**.
4. **Payment**: PayPal checkout (sandbox or simulator — see below). Funds are held by the
   processor; FlipLocker receives only its service fee (`platform_fees`).
5. **Seller alert**: "Payment received — ship now" email + dashboard banner; both portals show the
   live deal timeline.

An automated browser walkthrough of the whole path exists in the session scratchpad
(`walkthrough.mjs`) and was used to verify this flow.

## Configuration (never hardcoded)

All money/checkout numbers live in DB config tables, editable without code changes:

- `fee_config` (per plan FREE/PRO): flat **floor** below a **crossover price**, **percent (bps)**
  at/above it, **who pays** (BUYER / SELLER / SPLIT). Fee is a function of **sale price only** —
  comp/market value is never collected and has no column.
- `checkout_config`: minimum sale price, flat outbound shipping & signature line, insurance
  (cents per started $100, carrier pass-through), tax enable/default + per-state `tax_rates`.

Seed values mirror the client's current calculator (Free 4%/$10 floor, Pro 2%/$5 floor,
min $160, shipping $9.50, insurance $0.50/$100) — placeholders until final numbers are set.

## PayPal modes (`PAYPAL_MODE`)

- `simulator` (default): no external calls; the approval page is served locally so the full loop
  is demoable with zero credentials. Same interface, same records.
- `sandbox`: real PayPal Orders v2 against `api-m.sandbox.paypal.com` — set `PAYPAL_CLIENT_ID`,
  `PAYPAL_CLIENT_SECRET` (and `PAYPAL_WEBHOOK_ID` for signature-verified webhooks). Orders are
  created with `payment_instruction.disbursement_mode=DELAYED` and `platform_fees` = the service
  fee, per the multiparty architecture (funds held by PayPal, never by FlipLocker).
- `live`: same as sandbox against production (post PayPal program approval).

## Email

`RESEND_API_KEY` set → real sends via Resend. Unset (staging) → every message is captured in
`email_outbox` and browsable at `/dev/mailbox` (disable with `DEV_MAILBOX=off`). All sends are
archived to `email_outbox` either way.

## Media storage

`S3_BUCKET` set → real S3 presigned PUT/GET. Unset → a local adapter serves the same
presign → PUT → confirm flow with files under `web/.data/uploads` and signed view URLs.

## Guardrails

- `npm run check:copy` — fails the build if forbidden terminology appears in `src/` or `prisma/`
  (see `docs/COMPLIANCE-NOTES.md`; approved framing is "held securely by our payment processor").
- Deal state machine (`src/lib/deals.ts`) guards every transition server-side and appends a
  `deal_events` row — the transparency timeline is derived, never hand-written.
- No public marketplace surface: deals are reachable only by owner (seller), bound buyer, or
  invite token. There is no browse/search/listing route.
