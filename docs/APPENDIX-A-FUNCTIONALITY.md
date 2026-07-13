# APPENDIX A — FlipLocker Platform: Functionality List

**Referenced by and made part of the Software Development Agreement between Don Smith ("Client") and LVXG Brand Group, LLC ("Developer").**

---

## A-1. Overview

FlipLocker is a web platform that verifies and documents peer-to-peer graded trading card deals negotiated off-platform (e.g., on social media). Buyers and sellers bring an agreed deal to FlipLocker; the platform handles payment collection, physical verification at the FlipLocker hub, insured two-leg shipping with signature delivery, and release of the seller's funds on completion.

**Core rules:**

- Buyer payments are collected and **held by PayPal** (the payment processor) and released to the seller when delivery is signed for and the buyer review window closes. FlipLocker's account receives only its service fee.
- FlipLocker hosts no inventory and lists nothing for sale; deals are private and invitation-only. There is no public browsing, search, or listing of items.
- The service fee is a flat amount determined solely by the card's sale price tier. Card market/comp value is not collected or used.

## A-2. Brand & design

Logo and brand identity (colors, typography) for the FlipLocker name provided by Client; clean, modern, mobile-friendly UI applied across all portals and notifications; domain setup support.

## A-3. Deal creation & Seller Portal

- Account registration, login, email verification, password reset.
- **Create Deal:** card details (sport, year, player, grading company, certificate/serial number), front and rear photos, item description, sale price, and buyer's email. Minimum sale price $160 enforced automatically.
- Deal dashboard with live status for every deal.
- Prepaid **Leg 1 USPS shipping label** (seller → hub), generated after the buyer's payment is confirmed, with the label charge billed to the seller (amount configurable).
- **72-hour ship timer:** if the package receives no carrier scan within 72 hours of label generation, the deal auto-cancels and the buyer is automatically refunded.
- Alerts at each step, payout status, and PayPal payout account connection.

## A-4. Buyer Portal

- Email invitation to the deal; account creation/claim.
- Deal review page: photos, card details, and an itemized checkout (sale price, $9.50 flat outbound shipping & signature line, and configured fee/insurance/tax lines).
- **Accept & Pay** via PayPal checkout (funds held by PayPal), or Decline.
- Live tracking of both shipping legs; in-portal viewing of the hub inspection video and photos.
- **48-hour review window** after signed delivery: Approve, or Report an Issue; the deal auto-completes if the window passes with no report.

## A-5. Payments

- **PayPal platform/marketplace (multiparty) checkout:** buyer funds held by PayPal and released to the seller automatically upon signature-confirmed delivery plus the 48-hour review window; FlipLocker's service fee routed to FlipLocker at the same time.
- **Flat-tier service fee engine** driven by sale price brackets (e.g., $5–$30), fully configurable by Admin without code changes, including who pays the fee (seller, buyer, or split).
- Configurable **insurance line** ($0.50 per $100 of sale price) passed through from the shipping provider's declared-value coverage.
- **Sales tax line** configurable by delivery state per Client's tax policy.
- Automatic refund paths: buyer declines, 72-hour ship timer expiry, failed verification.
- Receipts and a full transaction record for all parties. Live processing subject to PayPal program approval (application submitted at kickoff; development proceeds in PayPal's test environment).

## A-6. Shipping & tracking

- USPS labels via shipping API for both legs: **Leg 1** (seller → hub, USPS Ground Advantage), **Leg 2** (hub → buyer, **signature required — never waived**).
- Webhook tracking updates displayed on a full deal timeline visible to both parties.
- Signature-delivery event starts the 48-hour review window and then triggers fund release.

## A-7. Hub Verification Portal (staff)

- Inbound queue of expected packages; check-in by scanning/entering the tracking number, which opens the matching deal.
- Damaged-packaging photo intake for insurance evidence.
- Upload of the **15-second inspection video** (automatically compressed for fast web playback) and **two reference photos**, attached to the deal.
- **Tamper-seal serial number entry**, permanently bound to the deal record.
- **Pass** → repack step and Leg 2 label generation. **Fail (condition mismatch)** → deal frozen, evidence sent to buyer, return label to seller, automatic buyer refund on carrier scan; seller return-shipping payment link.

## A-8. Admin dashboard

All deals and statuses; fee tier, insurance, and tax configuration; user management; manual overrides (cancel, refund, regenerate label, resolve flagged deals); basic reports (deal volume, fees collected).

## A-9. Notifications & records

- Automated **email and text (SMS) alerts** at every step of the deal for buyer and seller.
- **Terms of Service acknowledgment checkbox** required before a seller can generate a label; Client-provided ToS and Privacy pages implemented on-site.
- **Automatic media purge:** inspection videos deleted 30 days after confirmed delivery.

## A-10. Infrastructure

Responsive web application (desktop/tablet/phone); HTTPS throughout; secured cloud storage for photos and video; staging and production environments; launch deployment; first year of hosting included.

## A-11. Not included (available as future phases)

- Monthly subscription/membership tiers and recurring billing.
- Hub camera hardware integrations (automatic recording triggers, foot pedals, camera-feed control) — the portal accepts uploads from any camera.
- Native iOS/Android apps (the responsive web app covers mobile use).
- Live-stream, influencer, or marketing platform integrations.
- Additional payment processors beyond PayPal.
