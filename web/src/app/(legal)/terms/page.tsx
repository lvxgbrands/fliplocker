export const metadata = { title: "Terms of Service — FlipLocker" };

// PLACEHOLDER CONTENT — pending the Client's attorney review and approval.
// Written to the approved framing in docs/COMPLIANCE-NOTES.md: FlipLocker is a
// verification, documentation, and logistics service (not a grader, not a fund
// custodian). Wording intentionally avoids terms restricted by the copy rules.
export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-ink-500">
        <em>Placeholder terms for development. Final Terms are Client-provided and subject to the
        Client&apos;s attorney review before launch.</em>
      </p>

      <h2>1. What FlipLocker is</h2>
      <p>
        FlipLocker provides an administrative verification, documentation, and logistics service for
        privately negotiated, invitation-only trading-card deals. Buyers and sellers agree on a card
        and price off-platform and bring the deal to FlipLocker to close it safely. FlipLocker hosts
        no inventory and lists nothing for sale.
      </p>

      <h2>2. Payments</h2>
      <p>
        Buyer payments are collected and held by our payment processor (PayPal) and released to the
        seller after signature-confirmed delivery and the close of the buyer review window.
        FlipLocker does not take possession or control of buyers&apos; purchase funds and is not a
        money transmitter; FlipLocker&apos;s account receives only its service fee. The service fee
        is determined solely by the card&apos;s sale price and is described at checkout.
      </p>

      <h2>3. What verification does and does not cover</h2>
      <p>
        FlipLocker&apos;s hub confirms that a physical card matching the seller&apos;s listing, in a
        slab bearing a certificate number that is valid and active in the grading company&apos;s
        registry, passed through the hub and was documented on video and photographs. This is an
        administrative data-match and documentation service only.
      </p>
      <p>
        <strong>FlipLocker is not a grading service and does not perform forensic (chemical, paper,
        ink, or microscopic) examination.</strong> FlipLocker makes no warranty that a card is
        genuine or that a slab has not been altered, and does not represent any card as
        &ldquo;guaranteed genuine.&rdquo; Cards are <strong>verified and documented</strong>, not
        graded. Known limitations include a copied certificate number applied to a substitute item
        and a slab that has been opened and resealed.
      </p>

      <h2>4. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, FlipLocker&apos;s total liability arising from a deal
        is limited to the verification service fee paid for that deal. FlipLocker is not liable for
        the underlying value, grade, or genuineness of any card.
      </p>

      <h2>5. Shipping &amp; delivery</h2>
      <p>
        Deliveries to buyers require a signature, which is never waived. Declared-value coverage is
        passed through from the shipping carrier; FlipLocker does not sell its own coverage product.
      </p>

      <h2>6. Taxes</h2>
      <p>
        FlipLocker does not collect sales tax on the card itself; buyers and sellers are responsible
        for their own tax obligations. Where required, a tax line may apply to FlipLocker&apos;s own
        service charge.
      </p>

      <h2>7. Acknowledgment</h2>
      <p>
        By proceeding with a deal you acknowledge these terms, including the scope and limits of the
        verification service described above.
      </p>
    </>
  );
}
