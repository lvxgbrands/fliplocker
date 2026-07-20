# Deploying FlipLocker (staging → production)

The app runs anywhere Next.js runs. This is the Vercel + managed Postgres + S3
path (matches the contract), but any Node host works.

## 1. Database

Provision a PostgreSQL database (Vercel Postgres, Supabase, Neon, or RDS). Copy
its connection string into `DATABASE_URL`.

```bash
# from web/ with DATABASE_URL pointing at the new DB:
npx prisma migrate deploy      # apply migrations
npm run db:seed                # base config + FREE/PRO fees (+ demo accounts and real admin, per env; see "Real client launch" below)
npm run seed:demo              # populated demo data for a live walkthrough (skipped/torn down when demo is gated off)
```

## 2. Environment variables

Set these in the Vercel project (or host). See `.env.example` for the full list.

Required:
- `DATABASE_URL` — Postgres connection string
- `APP_URL` — the deployed URL (e.g. `https://staging.fliplocker.app`)
- `SESSION_SECRET` — a long random string

Marketing/SEO (optional — sensible defaults):
- `SITE_URL` — canonical origin for metadata/sitemap/JSON-LD (defaults to `https://fliplocker.app`).
- Newsletter: `RESEND_AUDIENCE_ID` (with `RESEND_API_KEY`) syncs opt-ins to a Resend audience; otherwise subscribers are captured in the `newsletter_subscribers` table.
- News ticker: defaults to a curated set of real headlines (simulator). To pull live headlines set `NEWS_MODE=live` plus either `NEWS_RSS_URL` (+ `NEWS_SOURCE_NAME`) or `NEWS_API_KEY` (+ `NEWS_QUERY`). Any failure falls back to the seeded headlines.

All of the above are optional — the marketing site, newsletter capture, contact
form, and news ticker all run in simulator mode with no third-party keys.

Staging (demo without third-party accounts) — leave provider keys blank and set:
- `PAYPAL_MODE=simulator`, `SHIPPING_MODE=simulator`
- `DEV_MAILBOX=on` (captured email/SMS at `/dev/mailbox`)
- `DEV_CONTROLS=on` (carrier/timer simulation buttons) — **turn OFF for anything client-facing beyond an internal demo**

Real client launch (lock down the demo data):
- Set `ADMIN_EMAIL` + `ADMIN_PASSWORD` (optional `ADMIN_NAME`) to seed a real administrator from secrets on each deploy. This alone turns the demo data OFF by default.
- The four shared-password demo accounts and nine demo deals are then not seeded, and any that already exist are torn down on the next deploy. Base config (checkout + FREE/PRO fees) is always seeded.
- To keep the demo data on the hosted sales demo even with a real admin present, set `SEED_DEMO=on`; to force it off regardless, set `SEED_DEMO=off`.
- Also turn `DEV_MAILBOX` and `DEV_CONTROLS` off.

Turn services on one at a time (no code change):
- **Payments** → `PAYPAL_MODE=sandbox`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` (+ `PAYPAL_BN_CODE`, `PAYPAL_MERCHANT_ID` for multiparty). Register the webhook at `POST $APP_URL/api/webhooks/paypal`.
- **Email** → `RESEND_API_KEY`, `EMAIL_FROM` (verify the `fliplocker.app` domain in Resend).
- **SMS** → `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`.
- **Shipping** → `SHIPPING_MODE=easypost`, `EASYPOST_API_KEY`, `EASYPOST_WEBHOOK_SECRET`. Point EasyPost trackers at `POST $APP_URL/api/webhooks/easypost`.
- **Media** → `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (+ `S3_ENDPOINT` for non-AWS).
- **Cron** → `CRON_SECRET` (Vercel injects it as the Authorization bearer on cron calls).

## 3. Deploy

Vercel: set the project **Root Directory** to `web/`. Build command
`npm run build`, install `npm install`. Push the branch or run `vercel deploy`.

`vercel.json` (in `web/`) registers a cron every 10 minutes hitting
`/api/jobs/tick`, which runs the 72h ship-timeout, 48h review auto-complete, and
30-day media purge. On other hosts, schedule any job to
`POST $APP_URL/api/jobs/tick` with header `Authorization: Bearer $CRON_SECRET`.

## 4. Smoke test

1. Register a seller, verify email (real inbox once Resend is on; `/dev/mailbox` otherwise).
2. Create a deal → buyer claims → Accept & Pay (PayPal sandbox once configured).
3. Confirm the seller "ship now" alert and the live timeline.
4. `curl -X POST $APP_URL/api/jobs/tick -H "Authorization: Bearer $CRON_SECRET"` → `{ "ok": true, ... }`.

The `e2e/` scripts can be pointed at the deployed URL (edit `BASE`) to run the
full lifecycle against staging.

## Going live

Flip `PAYPAL_MODE=live` (after PayPal marketplace approval) and
`SHIPPING_MODE=easypost` with production keys, set a production `APP_URL` and
domain, turn `DEV_CONTROLS`/`DEV_MAILBOX` off, and re-run the smoke test.
