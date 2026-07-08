# Flip Locker — Compliance & Advisory Notes (Internal / Client Record)

**Purpose:** record the legal, tax, and entity items that are the Client's responsibility and require the Client's own professional advisors to sign off. LVXG Brand Group, LLC provides software development services only and does not provide legal, tax, financial, or regulatory advice. These notes document what the software is built to enforce versus what depends on the Client's advisors and decisions.

_Last updated: July 8, 2026. Client: Don Smith / Flip Locker (entity being formed). Developer: LVXG Brand Group, LLC._

---

## 1. Money handling / licensing

- **Position relied on:** Flip Locker never takes possession or control of buyers' purchase funds. Payments run through PayPal's marketplace (multiparty) program; PayPal holds buyer funds and releases them to the seller on signature-confirmed delivery. Flip Locker's account receives only its service fee. Built this way, Flip Locker is not acting as a money transmitter and operates under PayPal's licenses.
- **Software enforces:** funds never route through a Flip Locker-controlled account; only the service fee is disbursed to Flip Locker.
- **Client responsibility / sign-off needed:** confirmation of the payment structure with a fintech/payments attorney; PayPal's approval of the business account for this program (third-party dependency, timing outside LVXG's control).
- **Language rule:** public site copy and Terms must not describe Flip Locker as a "licensed" entity or as an "escrow" provider unless the Client holds the corresponding license. Approved framing: funds "held securely by our payment processor until verification and delivery are complete."

## 2. Sales tax / marketplace-facilitator position

- **Position relied on:** Flip Locker is a private verification and logistics service for deals negotiated off-platform, not a marketplace facilitator, and therefore does not collect sales tax on the card sale. Buyers and sellers are responsible for their own tax obligations.
- **Software enforces the structural boundaries this position depends on:** (a) no public listing grid, browsing, search, or shopping-cart discovery — deals are private and invitation-only; (b) separated checkout line items (card amount labeled as a peer-to-peer transfer; Flip Locker's charge labeled as a service/logistics fee); (c) purchase funds never pass through Flip Locker's corporate account.
- **Client responsibility / sign-off needed:** written confirmation from the Client's CPA / state-and-local-tax advisor of the no-collection position, including whether Flip Locker's own service fee is itself taxable in Texas or any delivery state (the software supports a configurable tax line by state).
- **Language rule:** avoid describing the arrangement as "tax-exempt." Accurate framing: Flip Locker does not collect sales tax on the card; the parties handle their own tax.

## 3. Entity formation

- **On the critical path.** PayPal marketplace approval requires the formed entity, an EIN, and a business bank account in the entity's legal name. This is currently the tightest launch dependency.
- **Client responsibility:** form the entity, obtain the EIN, open the business bank account, and open/verify the PayPal business account — ideally in that order.
- **Open decision for Client's attorney:** LLC vs. corporation, given the investor intentions in the Client's business plan. Decide before filing; changing structure later is costly.
- **Action for LVXG:** once the entity is filed, obtain its exact legal name and update the Software Development Agreement and PayPal configuration so the name matches everywhere. (The current signed/draft agreement names Don Smith as an individual; if the contracting party becomes the entity, the agreement should be reissued in the entity's name.)

## 4. Other Client-owned items

- Insurance line ($0.50/$100) is presented as pass-through of the shipping carrier's declared-value coverage; Flip Locker is not selling its own insurance product. Any change to that requires review to avoid insurance-licensing exposure.
- Terms of Service, Privacy Policy, and all business policies are Client-provided/Client-approved content; LVXG implements them but does not author legal terms.
- Regulatory, tax, and licensing compliance of the business model is the Client's responsibility per the Software Development Agreement.

---

_This record supports the Software Development Agreement's allocation of legal/tax/regulatory responsibility to the Client. It is not legal or tax advice and does not substitute for the Client's own professional advisors._
