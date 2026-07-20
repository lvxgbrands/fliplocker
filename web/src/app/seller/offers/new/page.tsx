import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCheckoutConfig } from "@/lib/config";
import { CreateOfferForm } from "./create-offer-form";
import { VerifyEmailBanner } from "@/components/shell";

export default async function NewOfferPage() {
  const user = await requireUser();
  const checkout = await getCheckoutConfig();

  return (
    <div>
      <VerifyEmailBanner user={user} />
      <div className="mb-6">
        <Link href="/seller/offers" className="text-sm text-ink-400 hover:text-ink-600">
          ← Back to offers
        </Link>
        <h1 className="text-2xl font-bold mt-1">Post an open offer</h1>
        <p className="text-sm text-ink-500 mt-1">
          List a card at a fixed price and share one public link. The first buyer to pay wins, and the
          rest can join a waitlist in case it re-opens. No buyer email needed up front.
        </p>
      </div>
      <CreateOfferForm minSalePriceCents={checkout.minSalePriceCents} />
    </div>
  );
}
