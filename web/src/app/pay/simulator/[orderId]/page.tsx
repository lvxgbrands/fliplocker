import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { paypalMode } from "@/lib/paypal";
import { formatCents } from "@/lib/fees";
import { cardTitle } from "@/lib/deals";

// Stand-in for the PayPal sandbox approval page when no sandbox credentials
// are configured (PAYPAL_MODE=simulator). With real credentials the buyer is
// sent to PayPal's own sandbox checkout and never sees this page.
export default async function SimulatorCheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  if (paypalMode() !== "simulator") notFound();
  const { orderId } = await params;

  const payment = await db.payment.findUnique({
    where: { paypalOrderId: orderId },
    include: { deal: true },
  });
  if (!payment) notFound();
  const deal = payment.deal;

  // Full-page links, exactly like PayPal's own return/cancel redirects:
  // ?token={orderId} appended to the configured return_url / cancel_url.
  const returnUrl = `/pay/return?dealId=${deal.id}&token=${orderId}`;
  const cancelUrl = `/pay/cancel?dealId=${deal.id}&token=${orderId}`;

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-ink-200 overflow-hidden">
        <div className="bg-[#003087] px-6 py-4 flex items-center justify-between">
          <span className="text-white font-bold italic text-xl">
            Pay<span className="text-[#009cde]">Pal</span>
          </span>
          <span className="rounded bg-ink-800 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
            Sandbox simulator
          </span>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs text-ink-400">Paying FlipLocker deal {deal.shortCode}</p>
            <p className="font-semibold text-ink-800">{cardTitle(deal)}</p>
          </div>
          <div className="rounded-xl bg-ink-50 border border-ink-200 px-4 py-3">
            <div className="flex justify-between text-sm text-ink-600">
              <span>Order total</span>
              <span className="font-bold text-lg text-ink-900 tabular-nums">
                {formatCents(payment.grossCents)}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-400">
              Held by the payment processor · platform fee {formatCents(payment.platformFeeCents)} ·
              seller net {formatCents(payment.sellerNetCents)}
            </p>
          </div>
          <a
            href={returnUrl}
            className="block w-full rounded-full bg-[#ffc439] hover:bg-[#f2ba36] px-6 py-3 font-bold text-ink-900 text-center"
          >
            Pay {formatCents(payment.grossCents)}
          </a>
          <a href={cancelUrl} className="block w-full text-sm text-ink-500 hover:underline text-center">
            Cancel and return to FlipLocker
          </a>
          <p className="text-[11px] leading-relaxed text-ink-400 border-t border-ink-100 pt-3">
            This page simulates the PayPal sandbox approval step for staging demos without sandbox
            credentials. Set PAYPAL_MODE=sandbox with API credentials to run real PayPal sandbox
            checkout, the rest of the flow is identical.
          </p>
        </div>
      </div>
    </div>
  );
}
