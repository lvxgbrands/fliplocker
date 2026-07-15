# FlipLocker — Internal Build List (Engineering)

Internal checklist for the dev team. Client-facing scope lives in `APPENDIX-A-FUNCTIONALITY.md`; dates in `FlipLocker-Project-Timeline.md`. Keep this doc updated as tasks land.

## Proposed stack

| Layer | Choice | Notes |
|---|---|---|
| App | Next.js (React + TypeScript), single app with role-based portals | One codebase: seller / buyer / facilitator / admin views |
| API | Next.js API routes (or tRPC) | Webhook endpoints for PayPal + shipping |
| DB | PostgreSQL + Prisma | Supabase or RDS |
| Auth | Email/password + email verification (NextAuth or Supabase Auth) | Roles: SELLER, BUYER, FACILITATOR, ADMIN |
| Media | S3-compatible storage, presigned uploads | Photos (images) + unboxing videos (large files — direct-to-S3 multipart) |
| Payments | PayPal Orders v2 (authorize & capture) + Commerce Platform multiparty / delayed disbursement | See payment notes below |
| Shipping | EasyPost (or Shippo) → USPS | Leg 2 must include Signature Confirmation service |
| Email | Resend or SendGrid, React Email templates | All lifecycle notifications |
| Hosting | Vercel (app) + managed Postgres + S3 | Staging + production |

## Payment architecture notes ⚠️

- Client's hard requirement: **platform never holds purchase funds** — only its processing fee. Target: PayPal **Commerce Platform (multiparty)** with **delayed disbursement**: buyer pays at accept (authorize + capture), funds held in the seller's receivable, disbursed on signature-delivery webhook; platform fee taken as `platform_fees` on the order, released at the same time.
- Delayed disbursement requires **PayPal partner approval** — apply Week 1, this is the longest lead item. Fallback if approval slips past launch: capture to seller's PayPal at accept with contractual hold + fee as separate platform charge, switch to delayed disbursement when approved. Get client sign-off on the fallback in writing at the Week 1 kickoff.
- Fee engine: `fee = f(sale_price)` ONLY. Implement as a config table (flat / % / tiered rows) editable in Admin. Never read or store comp value — it's not even a DB column.
- Auth-void window: PayPal authorizations honor ~3 days (up to 29 with re-auth). Buyer declines or deal times out → void. Capture happens at accept, so this mostly matters for edge cases.

## Data model (first cut)

- `users` (role, email, password_hash, paypal_payout_info)
- `deals` (seller_id, buyer_email, buyer_id nullable until claim, description, sale_price_cents, fee_cents, status, timestamps)
- `deal_media` (deal_id, kind: FRONT_PHOTO | REAR_PHOTO | HUB_VIDEO | HUB_PHOTO_1 | HUB_PHOTO_2, s3_key)
- `payments` (deal_id, paypal_order_id, authorization_id, capture_id, state, amounts breakdown)
- `shipments` (deal_id, leg: TO_HUB | TO_BUYER, carrier, tracking_number, label_url, signature_required, status)
- `deal_events` (deal_id, type, actor, payload, created_at) — powers the transparency timeline; append-only
- `fee_schedule` (min_price, max_price, flat_cents, percent_bps)

## Deal state machine

```
DRAFT → CREATED → BUYER_NOTIFIED → ACCEPTED → PAID
  → AWAITING_SELLER_SHIPMENT → IN_TRANSIT_TO_HUB → RECEIVED_AT_HUB
  → VERIFIED → REPACKED → IN_TRANSIT_TO_BUYER → DELIVERED_SIGNED
  → FUNDS_RELEASED → COMPLETE
Exception states: DECLINED, CANCELLED, REFUNDED, FLAGGED
```

All transitions write a `deal_events` row. Guard transitions server-side (no status skipping).

---

## Week 1 — Foundation & Brand (7/6–7/12)

- [ ] Kickoff w/ client: fee schedule values, hub ship-from address, PayPal business account, final-name shortlist
- [ ] Start PayPal Commerce Platform / delayed-disbursement application ← **DO THIS DAY 1**
- [x] Repo scaffold: Next.js + TS + Prisma + CI (lint, typecheck, test on push)
- [ ] Staging environment + Postgres + S3 buckets (staging/prod)
- [x] Schema v1 migrated (tables above)
- [x] Auth: register, login, email verification, password reset, role guard middleware
- [x] Seller portal shell + Create Deal flow (front/rear photo presigned upload, description, price, buyer email, validation)
- [x] Deal dashboard (seller) with status chips
- [x] Buyer invitation email on deal creation (email service wired, first template)
- [ ] Brand: name candidates + domain screening deck; logo/color/type direction
- [ ] **Demo Fri 7/10:** brand deck + live create-deal on staging

## Week 2 — Buyer Flow & Payments (7/13–7/19)

- [x] Buyer invitation claim → registration → deal binds to buyer_id
- [x] Buyer deal review page (photos, description, cost breakdown incl. fee + shipping)
- [x] Accept / Decline endpoints + state transitions + seller notifications
- [x] Fee engine + `fee_schedule` config table
- [x] PayPal sandbox: order create (authorize) → capture on accept; webhook handler (PAYMENT.CAPTURE.COMPLETED etc.)
- [ ] Void-on-decline / void-on-timeout job
- [x] "Payment received — ship now" seller alert
- [x] Transparency timeline component (both portals) reading `deal_events`
- [ ] Apply final brand: name, logo, palette, email templates restyled
- [ ] **Demo Fri 7/17:** core loop end-to-end in sandbox
- [ ] **★ 7/21 client View Demo milestone** — rehearse Monday 7/20

## Week 3 — Shipping & Hub (7/20–7/26)

> **Build note:** External services (shipping/USPS, SMS, and the signature-delivery + timer webhooks) are implemented behind adapters with a **simulator mode** so the full lifecycle is demoable now; each flips to the real provider via env vars (`SHIPPING_MODE`, `TWILIO_*`, `EASYPOST_API_KEY`) with no code change. Real-provider webhook wiring and a 3+ cycle QA pass are finalized once provider credentials are in hand.

- [x] EasyPost integration: Leg 1 label purchase on PAID, PDF in seller portal
- [x] Tracking webhooks → `deal_events` + status transitions (IN_TRANSIT_TO_HUB, RECEIVED_AT_HUB…)
- [x] Facilitator portal: inbound queue, check-in by tracking #
- [x] Unboxing video upload (multipart to S3, playable in portal for buyer/seller/admin)
- [x] Two still-photo uploads + verification confirm / flag-mismatch action
- [x] Repack step → Leg 2 label with **USPS Signature Confirmation**
- [x] All shipping/hub notification emails
- [ ] **Demo Fri 7/24:** payment-to-doorstep logistics + hub flow

## Week 4 — Fund Release, Admin, Hardening (7/27–8/2)

- [x] Signature-delivery webhook → release seller disbursement + platform fee (or fallback path) → FUNDS_RELEASED → COMPLETE
- [x] Refund/cancel flows incl. FLAGGED mismatch → admin-triggered refund
- [x] Admin dashboard: deals table + detail, fee config UI, user management, manual overrides, basic reports (volume, fees collected)
- [ ] Full E2E QA: 3+ complete deal cycles on staging incl. exception paths
- [ ] Mobile responsive pass; accessibility sanity pass
- [x] Security review: authz on every endpoint, webhook signature verification, rate limits, media access control (signed URLs only)
- [x] ToS + Privacy pages
- [ ] Production env provisioned; secrets, domains, SSL
- [ ] **Demo Fri 7/31:** full lifecycle + admin
- [ ] **★ 8/1 final invoice**

## Launch Week (8/3–8/6)

- [ ] Production deploy + smoke test
- [ ] PayPal live-mode verification (or approved fallback config)
- [ ] Real test transaction end-to-end
- [ ] Monitoring/alerts (uptime, error tracking, webhook failure alarms)
- [ ] Client training walkthrough (all four roles) + handoff doc
- [ ] **🚀 Launch Thu 8/6**

## Post-launch (through 2/6/2027)

- [ ] Support intake channel for client
- [ ] Weekly error-log review
- [ ] PayPal delayed-disbursement cutover if it was pending at launch
