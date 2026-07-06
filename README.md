# CardDoc

**CardDoc** (working title) is a transaction-facilitation platform for peer-to-peer trading card deals negotiated on social media. It provides the payment, verification, and shipping infrastructure so a buyer and seller who agreed on a price can close the deal safely — with the card physically verified at the CardDoc hub before it reaches the buyer.

## Core principles (from the client)

1. **CardDoc never touches the purchase money.** Buyer funds flow to the seller; CardDoc collects only its processing fee.
2. **No inventory is hosted.** CardDoc is a pass-through verification hub, not a marketplace or storefront.
3. **The processing fee is based strictly on the agreed sale price.** Comp/market value of the card is irrelevant and is never collected or used.

## The deal flow

1. Seller and buyer agree on a price off-platform (social media).
2. Seller creates the deal in the **Seller Portal**: front photo, rear photo, description, sale price, buyer's email.
3. Buyer is alerted by email, logs into the **Buyer Portal**, reviews the deal, and hits **Accept**.
4. Buyer pays via **PayPal (authorize & capture)** — sale price + processing fee + shipping.
5. Seller is alerted that payment was captured; a **USPS shipping label** (seller → CardDoc hub) is generated in the system.
6. The package is tracked on the portal end-to-end for 100% transparency.
7. At the hub, a **Facilitator** videos the unboxing (evidence the correct card shipped), uploads **two still photos**, repacks, and ships to the buyer via **USPS with Signature Confirmation**.
8. On signature-confirmed delivery, the system **releases payment to the seller** and **releases the processing fee to CardDoc**.

## Repository layout

| Path | Contents |
|---|---|
| `docs/EXHIBIT-A-SCOPE.md` | Client-facing functionality list (Exhibit A of the services agreement) |
| `docs/EXHIBIT-B-TIMELINE.md` | 30-day expedited timeline, weekly milestones and demo coverage (Exhibit B) |
| `docs/BUILD-LIST.md` | Internal engineering build checklist |
| `docs/INVOICES.md` | PayPal invoice descriptions and schedule |
| `docs/agreement/` | DocuSign-ready services agreement (HTML source + PDF) |

## Key dates

| Date | Milestone |
|---|---|
| 7/6/2026 | Contract signed, down payment, development starts |
| 7/21/2026 | View Demo milestone |
| 8/1/2026 | Final payment |
| 8/6/2026 | Launch |
| 2/6/2027 | End of included 6-month support window |
