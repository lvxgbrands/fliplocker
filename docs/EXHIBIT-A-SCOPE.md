# EXHIBIT A — CardDoc Platform: Scope of Work & Functionality List

**Attached to and made part of the Software Development Services Agreement dated July 6, 2026 between Don Smith ("Client") and LVXG Brand Group, LLC ("Developer").**

---

## 1. Platform summary

CardDoc (working title, final name per Section 2) is a web-based transaction-facilitation platform for peer-to-peer trading card sales negotiated off-platform (e.g., on social media). CardDoc provides the payment, physical-verification, and shipping infrastructure to close those deals safely.

**Governing business rules:**

- CardDoc **does not hold or touch the buyer's purchase money**. Purchase funds are released to the seller; CardDoc receives only its processing fee.
- CardDoc **does not host inventory** or operate as a marketplace/storefront. It is a pass-through verification hub.
- The processing fee is calculated **strictly from the agreed sale price**. The card's comp/market value is irrelevant, is not collected, and is never used in fee calculation. (Example: card comps at $1,100 but sells for $900 — the fee is based only on $900.)

## 2. Brand & identity (included)

- Brand naming development: name candidates, availability screening (domain + basic trademark search), and final name selection with Client.
- Logo design (primary mark + variations), color palette, and typography.
- Brand application across the platform UI, email templates, and shipping/hub materials.
- Domain acquisition support (domain registration costs paid by Client).

## 3. User roles

| Role | Description |
|---|---|
| **Seller** | Creates deals, ships card to hub, receives payout on completion |
| **Buyer** | Reviews deal, accepts, pays via PayPal, receives verified card |
| **Facilitator** | Hub staff — receives packages, records unboxing video, uploads verification photos, repacks, ships out |
| **Admin** | Owner — full visibility, fee configuration, user management, overrides |

## 4. Seller Portal

- Account registration and login (email + password, password reset, email verification).
- **Create Deal** flow: upload **front photo** and **rear photo** of the card, enter **item description**, **sale price**, and **buyer's email address**.
- Automatic buyer notification when a deal is created.
- Deal dashboard listing all deals with live status.
- Alerts: buyer accepted, payment captured ("you may now ship"), package received at hub, delivered to buyer, **funds released**.
- **Prepaid USPS shipping label generated in the system** (seller → CardDoc hub) once payment is captured; printable/downloadable from the portal.
- Live tracking of both shipping legs from the deal page.
- Seller payout account connection (PayPal) and payout status visibility.

## 5. Buyer Portal

- Email invitation when a seller creates a deal addressed to the buyer's email; buyer creates/claims an account from the invitation.
- Deal review page: both photos, item description, sale price, and a clear cost breakdown (sale price + processing fee + shipping, allocation per fee configuration).
- **Accept** button (and Decline, which cancels the deal and notifies the seller).
- **PayPal checkout using authorize & capture** upon acceptance.
- Live tracking of both shipping legs.
- Access to the hub verification evidence: unboxing video and the two still photos.
- Delivery is by **USPS with Signature Confirmation**; signature event is visible on the deal timeline.

## 6. Payments (PayPal)

- PayPal integration using the **authorize & capture** model: funds authorized when the buyer accepts and pays; captured per the payment flow approved with PayPal.
- Payment structure such that **CardDoc receives only its processing fee**; the purchase amount is disbursed to the seller — released automatically upon signature-confirmed delivery (PayPal multiparty/delayed-disbursement configuration, subject to PayPal's approval of the business account for this flow).
- **Fee engine:** processing fee computed solely as a function of sale price. Fee schedule (flat, percentage, or tiered) is set by Admin and configurable without code changes.
- Automatic release trigger: USPS signature-confirmed delivery → release seller funds + release CardDoc processing fee.
- Receipts/confirmation emails for buyer; transaction record for all parties.
- Cancellation and exception handling: void authorization on decline/timeout; refund path for deals cancelled after capture (e.g., wrong card shipped).

## 7. Shipping & tracking

- USPS label generation via shipping API for both legs:
  - **Leg 1:** Seller → CardDoc hub.
  - **Leg 2:** CardDoc hub → Buyer, with **Signature Confirmation required**.
- Tracking numbers attached to the deal automatically; webhook-driven tracking updates displayed on the deal timeline — **100% transparency** for both parties.
- Signature-confirmed delivery event automatically triggers fund release (Section 6).
- Label costs allocated per fee configuration (built into buyer's checkout total or fee, per Client's pricing decision).

## 8. Facilitator Hub Portal

- Inbound queue: expected packages with tracking status, searchable by tracking number or deal.
- Package check-in (scan/enter tracking number → pulls up the deal).
- **Unboxing video upload** — evidence that the correct card was shipped.
- **Two still-photo uploads** of the card, attached to the deal and visible to both parties.
- Verification confirmation step (card matches deal photos/description) with an exception path (mismatch → deal flagged, Admin notified, refund workflow).
- Mark repacked → outbound label (Leg 2) generated with Signature Confirmation.
- All hub actions timestamped on the deal's chain-of-custody timeline.

## 9. Admin dashboard

- All deals with status, participants, amounts, and timeline.
- Fee schedule configuration.
- User management (sellers, buyers, facilitators).
- Manual controls: cancel deal, trigger refund, regenerate label, resolve exceptions.
- Reporting: deal volume, fees collected, deals by status.

## 10. Notifications

Automated transactional email at every step: deal created (buyer invite), buyer accepted, payment captured (seller "ship now"), package received at hub, verification complete, shipped to buyer, out for delivery, **delivered & signed**, funds released, plus decline/cancel/exception notices.

## 11. Deal status timeline (transparency)

Every deal displays a full, timestamped status history visible to seller and buyer:

`Created → Buyer Notified → Accepted → Paid → Awaiting Seller Shipment → In Transit to Hub → Received at Hub → Verified (video + 2 photos) → Repacked → In Transit to Buyer → Delivered & Signed → Funds Released → Complete`

Exception states: `Declined`, `Cancelled`, `Refunded`, `Flagged (verification mismatch)`.

## 12. Non-functional & infrastructure

- Responsive web application (desktop, tablet, phone browsers).
- HTTPS/SSL throughout; media (videos/photos) stored in secured cloud storage.
- Staging and production environments; production hosting setup and launch deployment.
- Terms of Service and Privacy Policy pages (content template provided; Client's counsel to review).

## 13. Included support

**Six (6) months of technical support following launch** (through February 6, 2027): bug fixes, security patches, uptime monitoring, and minor adjustments. New features and scope changes are handled via change order.

## 14. Assumptions & exclusions

- No card grading, authentication opinion, or valuation is performed by the platform; hub verification is photographic/video evidence that the shipped card matches the listing.
- Comp/market value is not collected or displayed anywhere in the system.
- Native iOS/Android apps are out of scope (responsive web covers mobile use).
- Ongoing third-party costs are Client's responsibility: hosting, domain, PayPal processing fees, shipping/postage, shipping-API fees, email delivery service.
- Client is responsible for hub operations (facility, staffing, packaging materials) and for legal/regulatory compliance of the business model (including any money-transmission, escrow, or marketplace regulations); Developer provides software only, not legal or financial advice.
- PayPal's approval of the Client's business account for multiparty/delayed-disbursement payments is a third-party dependency; Developer will build to PayPal's standard APIs and assist with the application, but approval timing rests with PayPal.
- Processing fee amount/percentage is set by Client (system makes it configurable).
