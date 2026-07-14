import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCheckoutConfig } from "@/lib/config";
import { CreateDealForm } from "./create-deal-form";
import { VerifyEmailBanner } from "@/components/shell";

export default async function NewDealPage() {
  const user = await requireUser();
  const checkout = await getCheckoutConfig();

  return (
    <div>
      <VerifyEmailBanner user={user} />
      <div className="mb-6">
        <Link href="/seller" className="text-sm text-slate-400 hover:text-slate-600">
          ← Back to deals
        </Link>
        <h1 className="text-2xl font-bold mt-1">Create a deal</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter the card and the price you and your buyer already agreed on. We&apos;ll email them a
          private invitation to review and pay.
        </p>
      </div>
      <CreateDealForm minSalePriceCents={checkout.minSalePriceCents} />
    </div>
  );
}
