import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How FlipLocker collects, uses, retains, and shares information to operate its documentation and logistics service, including 30-day auto-purge of hub inspection media.",
  path: "/privacy",
});

// PLACEHOLDER CONTENT, pending the Client's attorney review and approval.
export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-ink-400">Last updated: July 15, 2026</p>
      <p className="text-ink-500">
        <em>
          Placeholder policy for development. Final Privacy Policy is Client-provided and subject to the
          Client&apos;s attorney review before launch. Nothing here is legal advice.
        </em>
      </p>
      <p>
        This Privacy Policy explains what information FlipLocker collects, how we use it, and the choices you
        have. It applies to the FlipLocker marketing site and the deal platform.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account details</strong>, name, email, and an optional phone number for SMS alerts.</li>
        <li><strong>Deal details</strong>, card information, photos, sale price, grade, certificate number, and the counterparty&apos;s email.</li>
        <li><strong>Transaction records</strong>, the timestamped events, shipping tracking, and documentation needed to process a deal.</li>
        <li><strong>Newsletter</strong>, if you opt in, your email address and the source of the signup.</li>
        <li><strong>Contact messages</strong>, anything you send us through the contact form or by email.</li>
        <li><strong>Technical data</strong>, basic session and device information needed to keep the service secure.</li>
      </ul>

      <h2>2. How we use it</h2>
      <p>
        To operate the documentation and logistics service: create and track deals, send lifecycle
        notifications by email and text, process payments through our payment processor, produce transaction
        records for the parties, provide support, and, if you opt in, send you our newsletter. We use
        technical data to keep accounts and deals secure.
      </p>

      <h2>3. Payment information</h2>
      <p>
        Payment card and payout details are handled by our payment processor (PayPal). FlipLocker does not
        store full payment credentials, and buyer funds are held by the processor, not by FlipLocker.
      </p>

      <h2>4. Documentation &amp; media retention (auto-purge)</h2>
      <p>
        The hub captures a short inspection video and reference photos for each deal. By default, this
        inspection media is <strong>automatically purged 30 days after confirmed delivery.</strong> The deal&apos;s
        transaction record is retained as needed for the transaction and support. See{" "}
        <Link href="/platform/media-auto-purge">Media auto-purge</Link> for details.
      </p>

      <h2>5. Cookies &amp; sessions</h2>
      <p>
        We use strictly necessary cookies to keep you signed in and to operate the service securely. We do not
        use the marketing site to build advertising profiles of you.
      </p>

      <h2>6. Sharing</h2>
      <p>
        We share information only as needed to complete a deal, for example, shipping details with the carrier
        and payment details with the payment processor, or as required by law. Deals are private and
        invitation-only; FlipLocker does not publish listings or sell your personal information.
      </p>

      <h2>7. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect your information, including limiting
        access and purging sensitive inspection media on the schedule above. No system is perfectly secure, but
        minimizing what we retain is a core part of our approach.
      </p>

      <h2>8. Data retention</h2>
      <p>
        We keep account and transaction records for as long as needed to provide the service, resolve disputes,
        and meet legal obligations. Inspection media follows the 30-day post-delivery auto-purge default.
      </p>

      <h2>9. Your choices &amp; rights</h2>
      <ul>
        <li>Access or correct your information, or close your account, by contacting support.</li>
        <li>Unsubscribe from the newsletter at any time using the link in any newsletter email.</li>
        <li>Request deletion of personal information, subject to records we must retain by law.</li>
      </ul>

      <h2>10. Children</h2>
      <p>
        FlipLocker is not directed to children and is intended for users who can form a binding contract.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time; the &ldquo;last updated&rdquo; date above reflects the most
        recent change.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about privacy? Email <a href="mailto:support@fliplocker.app">support@fliplocker.app</a> or use
        our <Link href="/contact">contact page</Link>.
      </p>
    </>
  );
}
