import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "The terms governing use of FlipLocker — a documentation and logistics service for private, invitation-only peer-to-peer trading-card deals. FlipLocker documents and ships cards; it does not grade them or hold buyer funds.",
  path: "/terms",
});

// PLACEHOLDER CONTENT — pending the Client's attorney review and approval.
// Written to the approved framing in docs/COMPLIANCE-NOTES.md: FlipLocker is a
// documentation and logistics service (not a grader, not a fund custodian).
// Wording intentionally avoids terms restricted by the copy rules.
export default function TermsPage() {
  return (
    <>
      <h1>Terms &amp; Conditions</h1>
      <p className="text-ink-400">Last updated: July 15, 2026</p>
      <p className="text-ink-500">
        <em>
          Placeholder terms for development. Final Terms are Client-provided and subject to the
          Client&apos;s attorney review before launch. Nothing here is legal advice.
        </em>
      </p>
      <p>
        These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of FlipLocker
        (&ldquo;FlipLocker,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). By creating an account, accepting an
        invitation, or otherwise using the service, you agree to these Terms.
      </p>

      <h2>1. What FlipLocker is</h2>
      <p>
        FlipLocker provides an administrative documentation and logistics service for privately
        negotiated, invitation-only trading-card deals. Buyers and sellers agree on a card and price
        off-platform and bring the deal to FlipLocker to close it safely. FlipLocker hosts no inventory,
        lists nothing for sale, and is not a marketplace or auction house. Card coverage is currently
        limited to baseball.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>Deal</strong> — a single transaction between a seller and an invited buyer for a specific card at an agreed price.</li>
        <li><strong>Hub</strong> — the FlipLocker documentation facility where a card is inspected, documented, and tamper-sealed.</li>
        <li><strong>Documentation</strong> — the neutral record (video, photos, tamper seal, registry match) created for a deal.</li>
        <li><strong>Payment processor</strong> — the third party (PayPal) that collects and holds buyer funds for a deal.</li>
      </ul>

      <h2>3. Eligibility &amp; accounts</h2>
      <p>
        You must be able to form a binding contract to use FlipLocker. You are responsible for the
        accuracy of your account details, for keeping your credentials secure, and for all activity under
        your account. You must confirm your email address to activate an account.
      </p>

      <h2>4. Invitation-only nature</h2>
      <p>
        FlipLocker deals are private. A seller creates a deal and invites a specific buyer by email; there
        is nothing to browse, bid on, or buy on the platform. You agree not to use FlipLocker to solicit
        the general public or to list cards for open sale.
      </p>

      <h2>5. Payments</h2>
      <p>
        Buyer payments are collected and held by our payment processor and released to the seller after
        signature-confirmed delivery and the close of the buyer review window. <strong>FlipLocker does not
        take possession or control of buyers&apos; purchase funds and is not a money transmitter;</strong>{" "}
        FlipLocker&apos;s account receives only its service fee. The service fee is determined solely by the
        card&apos;s sale price — never a card&apos;s comp or market value — and is itemized at checkout
        before anyone pays. Who pays the fee (buyer, seller, or split) is configurable per deal.
      </p>

      <h2>6. The deal lifecycle</h2>
      <p>
        A typical deal proceeds: creation and buyer invitation; buyer acceptance and payment (held by the
        processor); seller ships to the hub on a prepaid, insured label within the ship window; hub
        inspection and documentation; insured, signature-required delivery to the buyer; a buyer review
        window; then release of the seller&apos;s payout. Timers and windows are shown on the deal timeline
        and may be adjusted by FlipLocker as a platform setting.
      </p>

      <h2>7. What documentation does and does not cover</h2>
      <p>
        FlipLocker&apos;s hub confirms that a physical card matching the seller&apos;s listing, in a slab
        bearing a certificate number that is valid and active in the grading company&apos;s registry, passed
        through the hub and was documented on video and photographs with a logged tamper seal. This is an
        administrative data-match and documentation service only.
      </p>
      <p>
        <strong>FlipLocker is not a grading service and does not perform forensic (chemical, paper, ink, or
        microscopic) examination.</strong> FlipLocker makes no warranty that a card is genuine or that a slab
        has not been altered, and does not represent any card as &ldquo;guaranteed genuine.&rdquo; Cards are{" "}
        <strong>documented</strong>, not graded. Known limitations include a copied certificate number applied
        to a substitute item and a slab that has been opened and resealed.
      </p>

      <h2>8. Seller &amp; buyer obligations</h2>
      <ul>
        <li>Sellers must accurately describe the card and ship the exact documented item within the ship window.</li>
        <li>Buyers must provide a valid delivery address and be available to sign for delivery.</li>
        <li>Both parties must act in good faith and not attempt to move the settlement off-platform to avoid the safeguards described here.</li>
      </ul>

      <h2>9. Shipping &amp; delivery</h2>
      <p>
        Deliveries to buyers require a signature, which is never waived. Both shipping legs are insured, and
        declared-value coverage is passed through from the shipping carrier; FlipLocker does not sell its own
        coverage product.
      </p>

      <h2>10. Cancellations, refunds &amp; flagged deals</h2>
      <p>
        If a card fails inspection at the hub — it does not match the seller&apos;s listing — the deal is
        flagged, the buyer is refunded from the held funds, the documentation is shared with both parties, and
        a return label is issued to the seller. A deal not paid for does not proceed and may be cancelled.
      </p>

      <h2>11. Prohibited conduct</h2>
      <ul>
        <li>Misrepresenting a card, shipping a different item, or tampering with a slab or seal.</li>
        <li>Using FlipLocker for anything other than a genuine, privately agreed deal.</li>
        <li>Attempting to defeat, bypass, or disable the platform&apos;s safeguards.</li>
      </ul>

      <h2>12. Taxes</h2>
      <p>
        FlipLocker does not collect sales tax on the card itself; buyers and sellers are responsible for their
        own tax obligations. Where required, a tax line may apply to FlipLocker&apos;s own service charge.
      </p>

      <h2>13. Disclaimers of warranties</h2>
      <p>
        The service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; To the maximum extent
        permitted by law, FlipLocker disclaims all warranties, express or implied, including regarding the
        genuineness, grade, condition, or value of any card. See the <Link href="/disclaimer">Disclaimer</Link> for
        a fuller statement.
      </p>

      <h2>14. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, FlipLocker&apos;s total liability arising from a deal is
        limited to the documentation service fee paid for that deal. FlipLocker is not liable for the
        underlying value, grade, or genuineness of any card, nor for indirect, incidental, or consequential
        damages.
      </p>

      <h2>15. Indemnification</h2>
      <p>
        You agree to indemnify and hold FlipLocker harmless from claims arising out of your deals, your breach
        of these Terms, or your violation of any law or third-party right.
      </p>

      <h2>16. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be reflected by the &ldquo;last
        updated&rdquo; date above, and continued use after a change constitutes acceptance.
      </p>

      <h2>17. Acknowledgment &amp; contact</h2>
      <p>
        By proceeding with a deal you acknowledge these Terms, including the scope and limits of the
        documentation service described above. Questions? Email{" "}
        <a href="mailto:support@fliplocker.app">support@fliplocker.app</a> or visit our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </>
  );
}
