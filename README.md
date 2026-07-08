# Flip Locker

**Flip Locker** is a transaction verification and logistics platform for peer-to-peer graded trading card deals negotiated off-platform (e.g., on social media). It provides the payment, physical-verification, and shipping infrastructure so a buyer and seller who agreed on a price can close the deal safely — with the card physically verified at the Flip Locker hub before it reaches the buyer.

## Core principles

1. **Flip Locker never touches the purchase money.** Buyer funds are held by the payment processor (PayPal) and released to the seller; Flip Locker's account receives only its service fee.
2. **No inventory, no marketplace.** Deals are private and invitation-only — there is no public browsing, search, or listing of cards. Flip Locker is a pass-through verification hub.
3. **The service fee is based strictly on the sale price.** The card's comp/market value is irrelevant and is never collected or used.

## The deal flow

1. Seller and buyer agree on a price off-platform (social media).
2. Seller creates the deal in the **Seller Portal**: card details, front/rear photos, description, sale price, and buyer's email ($160 minimum).
3. Buyer is invited by email, logs into the **Buyer Portal**, reviews the deal, and hits **Accept & Pay**.
4. Buyer pays via **PayPal** — funds held by PayPal, not by Flip Locker.
5. Seller is alerted that payment cleared; a **USPS Leg 1 label** (seller → hub) is generated. A 72-hour ship timer applies.
6. The package is tracked on the portal end-to-end for 100% transparency.
7. At the hub, a **Facilitator** records a 15-second inspection video, uploads two reference photos, logs the tamper-seal serial, repacks, and ships to the buyer via **USPS with Signature Confirmation** (Leg 2).
8. On signature-confirmed delivery plus a 48-hour buyer review window, the system **releases the seller's payout and Flip Locker's service fee**.

## Repository layout

| Path | Contents |
|---|---|
| `docs/APPENDIX-A-FUNCTIONALITY.md` | Client-facing functionality list (Appendix A of the development agreement) |
| `docs/FlipLocker-Project-Timeline.md/.pdf` — see PDF | Client-facing 30-day timeline, weekly milestones, demo coverage, payment schedule |
| `docs/BUILD-LIST.md` | Internal engineering build checklist (stack, data model, state machine) |
| `docs/INVOICES.md` | PayPal invoice descriptions and schedule |
| `docs/COMPLIANCE-NOTES.md` | Client-owned legal/tax/entity items requiring CPA/attorney sign-off |
| `docs/agreement/FlipLocker-Development-Agreement.html/.pdf` | DocuSign-ready development agreement with Appendix A embedded |

## Key figures

- **Total price:** $9,600 — $5,000 retainer (signing) · $2,300 (7/21 View Demo) · $2,300 (8/1 final). Includes brand identity, full platform, launch, 6-month support, and 1-year hosting.
- **Launch target:** August 6, 2026 (30-day expedited schedule).
- **Payments:** PayPal marketplace (multiparty) — live processing pending PayPal's approval of the client's business account.

## Key dates

| Date | Milestone |
|---|---|
| 7/6/2026 | Contract signed, retainer, development starts |
| 7/21/2026 | View Demo milestone |
| 8/1/2026 | Final payment |
| 8/6/2026 | Launch |
| 2/6/2027 | End of included 6-month support window |
