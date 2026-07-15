import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Disclaimer",
  description:
    "FlipLocker documents and ships cards but does not grade them or guarantee they are genuine, is not a financial custodian of buyer funds, and is not a marketplace or investment adviser.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <>
      <h1>Disclaimer</h1>
      <p className="text-ink-400">Last updated: July 15, 2026</p>
      <p className="text-ink-500">
        <em>
          Placeholder disclaimer for development, subject to the Client&apos;s attorney review before launch.
          Nothing here is legal, financial, or investment advice.
        </em>
      </p>
      <p>
        Please read this Disclaimer carefully. It explains, in plain terms, what FlipLocker does and, just as
        importantly, what it does not do. It works together with our <Link href="/terms">Terms &amp; Conditions</Link>{" "}
        and <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. We document and ship, we do not grade</h2>
      <p>
        FlipLocker is a documentation and logistics service. We inspect, film, photograph, tamper-seal, and ship
        cards, and we confirm that a slab&apos;s certificate number is active in the grading company&apos;s
        registry. <strong>We do not grade cards, and we do not judge or guarantee whether a card is genuine.</strong>{" "}
        The grade printed on a slab is the grading company&apos;s opinion, not ours.
      </p>

      <h2>2. Documentation is a data-match, not a guarantee of genuineness</h2>
      <p>
        Documentation is an administrative record of a card&apos;s identity, condition, and chain of custody in
        transit. It is not a forensic (chemical, paper, ink, or microscopic) examination. A genuine certificate
        number can be reprinted onto a counterfeit slab and still pass a registry lookup, and a slab that has been
        opened and resealed may not be detectable by inspection alone. For this reason we describe cards as{" "}
        <strong>documented</strong>, never as guaranteed genuine. See <Link href="/security">Security &amp; limits</Link>{" "}
        for the full explanation.
      </p>

      <h2>3. We do not hold your money</h2>
      <p>
        Buyer payments are collected and held by our payment processor (PayPal), not by FlipLocker.{" "}
        <strong>FlipLocker never takes possession or control of buyers&apos; purchase funds and is not a money
        transmitter.</strong> Our account receives only the service fee for a deal. FlipLocker does not provide
        financial custody of buyer funds and is not a financial institution.
      </p>

      <h2>4. No investment or value advice</h2>
      <p>
        Nothing on FlipLocker is investment advice or a valuation. The service fee is based on a deal&apos;s sale
        price only and never reflects a card&apos;s comp or market value. We make no representation about whether
        any card is a good purchase or what it may be worth in the future.
      </p>

      <h2>5. Not a marketplace</h2>
      <p>
        FlipLocker is invitation-only and hosts no listings. We do not broker, price, or solicit sales. Buyers and
        sellers agree on a card and price entirely off-platform and bring the finished deal to us to close safely.
      </p>

      <h2>6. Third-party news &amp; links</h2>
      <p>
        The card-market news headlines shown on our site link to third-party publications for convenience. Those
        articles are the work of their publishers; FlipLocker does not endorse, confirm, or take responsibility for
        third-party content, and inclusion of a headline is not a recommendation.
      </p>

      <h2>7. No professional advice</h2>
      <p>
        Information on this site is provided for general purposes and is not legal, tax, or financial advice.
        Consult your own professional for advice specific to your situation.
      </p>

      <h2>8. Limitation</h2>
      <p>
        To the maximum extent permitted by law, FlipLocker&apos;s liability is limited as described in our{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>. Cards are documented, not graded or guaranteed genuine, and
        buyer funds are held by our payment processor.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this Disclaimer? Email <a href="mailto:support@fliplocker.app">support@fliplocker.app</a>{" "}
        or visit our <Link href="/contact">contact page</Link>.
      </p>
    </>
  );
}
