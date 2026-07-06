# EXHIBIT B — 30-Day Expedited Timeline, Milestones & Payment Schedule

**Attached to and made part of the Software Development Services Agreement dated July 6, 2026 between Don Smith ("Client") and LVXG Brand Group, LLC ("Developer").**

Expedited schedule assumes signature and down payment on **July 6, 2026** and immediate start. Client feedback turnaround of 2 business days or less is required to hold these dates.

---

## Payment schedule

| Date | Amount | Milestone |
|---|---|---|
| **7/6/2026** | **$5,000** | Down payment — signing & project start |
| **7/21/2026** | **$1,400** | View Demo milestone |
| **8/1/2026** | **$1,400** | Final payment |
| **8/6/2026** | — | **Launch** |

**Total: $7,800** — includes brand naming development, brand design, full platform build per Exhibit A, and 6 months of post-launch technical support (through 2/6/2027).

---

## Week 1 — Foundation & Brand (Mon 7/6 – Sun 7/12)

**Build:**
- Project kickoff; confirm fee schedule, hub shipping address, and PayPal business account details with Client.
- Brand naming development: name candidates + domain screening presented; brand direction (logo concepts, colors, type).
- Technical foundation: repository, staging environment, database schema (users, deals, media, payments, shipments, events), authentication (register/login/reset).
- Seller Portal: Create Deal flow — front/rear photo uploads, description, price, buyer email; deal dashboard.
- Buyer invitation email on deal creation.
- Begin PayPal business-account/multiparty application with Client (long-lead item).

**Friday 7/10 demo covers:** brand name candidates and design direction; live staging walkthrough — seller registers, creates a deal with photos and price, and the buyer invitation email fires.

## Week 2 — Buyer Flow & Payments (Mon 7/13 – Sun 7/19)

**Build:**
- Buyer Portal: invitation claim/registration, deal review page with photos, description, and full cost breakdown.
- Accept / Decline flow.
- PayPal authorize & capture integration (sandbox): buyer accepts → pays; fee engine computing processing fee from sale price only.
- Seller "payment received — ship now" alert.
- Deal status timeline component (transparency view) for both portals.
- Brand finalized: name locked, logo and palette applied across portals and emails.

**Friday 7/17 demo covers:** full core deal loop on staging — seller creates deal → buyer notified → buyer reviews and accepts → PayPal sandbox payment (authorize & capture) → seller alerted. Branded UI.

### ★ Tuesday 7/21 — VIEW DEMO MILESTONE ($1,400 invoice)

Formal client demo of the above end-to-end core transaction flow. This is the contract's "View Demo" payment milestone.

## Week 3 — Shipping, Tracking & the Hub (Mon 7/20 – Sun 7/26)

**Build:**
- Shipping API integration (USPS): Leg 1 label (seller → hub) auto-generated on payment capture, printable from Seller Portal.
- Webhook tracking updates on the deal timeline for both parties.
- Facilitator Hub Portal: inbound queue, package check-in by tracking number, unboxing video upload, two still-photo uploads, verification confirm/flag, repack step.
- Leg 2 label (hub → buyer) with USPS Signature Confirmation.
- Notification emails for all shipping/hub events.

**Friday 7/24 demo covers:** payment-to-doorstep logistics — label generation, live tracking on the portal, facilitator checks in a package, uploads video + 2 photos, repacks, and generates the signature-required outbound label.

## Week 4 — Fund Release, Admin & Hardening (Mon 7/27 – Sun 8/2)

**Build:**
- Delivery-signature webhook → automatic fund release: seller payout + CardDoc processing fee release.
- Decline/cancel/refund and verification-mismatch exception paths.
- Admin dashboard: all deals, fee configuration, user management, manual overrides, basic reporting.
- Full end-to-end QA (multiple complete deal cycles on staging), mobile-responsive pass, security review, ToS/Privacy pages.
- Production environment provisioned; PayPal live credentials configured (pending PayPal approval status).

**Friday 7/31 demo covers:** the complete lifecycle in one sitting — create → accept → pay → ship → hub verification → ship out → signature delivery (simulated) → **automatic fund release** — plus the Admin dashboard.

### ★ Saturday 8/1 — FINAL PAYMENT ($1,400 invoice)

## Launch Week (Mon 8/3 – Thu 8/6)

- Production deployment, domain + SSL live, PayPal live-mode verification, real-world test transaction, monitoring/alerting enabled.
- Client walkthrough/training session (Seller, Buyer, Facilitator, and Admin roles).

### 🚀 Thursday 8/6 — LAUNCH

## Post-launch

**8/6/2026 – 2/6/2027:** included 6-month support window — bug fixes, security patches, uptime monitoring, minor adjustments.

---

## Schedule dependencies

The 30-day schedule depends on: (1) down payment received 7/6; (2) Client feedback within 2 business days of each demo; (3) Client promptly providing PayPal business account access, hub shipping address, and fee schedule in Week 1; (4) third-party approval timelines (notably PayPal multiparty/delayed-disbursement approval), which are outside Developer's control — if PayPal approval is pending at launch, the platform launches with a Developer-proposed interim payment configuration and switches over on approval.
