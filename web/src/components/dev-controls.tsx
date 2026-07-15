import type { DealStatus } from "@prisma/client";
import { devControlsEnabled } from "@/lib/dev";
import { devScanToHub, devReceiveAtHub, devDeliverSigned, devRunTimers } from "@/app/dev/actions";

// Staging-only cluster that simulates carrier scans / timer expiry that would
// otherwise come from carrier webhooks and elapsed time. Hidden in production.
export function DevControls({ dealId, status }: { dealId: string; status: DealStatus }) {
  if (!devControlsEnabled()) return null;

  const buttons: { label: string; action: (fd: FormData) => Promise<void> }[] = [];
  if (status === "AWAITING_SELLER_SHIPMENT") {
    buttons.push({ label: "Carrier accepted → in transit", action: devScanToHub });
    buttons.push({ label: "Expire 72h ship timer (auto-cancel)", action: devRunTimers });
  }
  if (status === "IN_TRANSIT_TO_HUB") buttons.push({ label: "Arrived at hub", action: devReceiveAtHub });
  if (status === "IN_TRANSIT_TO_BUYER") buttons.push({ label: "Delivered & signed", action: devDeliverSigned });
  if (status === "DELIVERED_SIGNED") buttons.push({ label: "Close 48h review window (auto-complete)", action: devRunTimers });

  if (buttons.length === 0) return null;

  return (
    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-2">
        Staging simulator — carrier &amp; timers
      </p>
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <form key={b.label} action={b.action}>
            <input type="hidden" name="dealId" value={dealId} />
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
            >
              {b.label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
