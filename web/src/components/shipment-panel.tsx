import Link from "next/link";
import type { Shipment } from "@prisma/client";
import { formatCents } from "@/lib/fees";

function Row({ shipment }: { shipment: Shipment }) {
  const leg = shipment.leg === "TO_HUB" ? "Leg 1 · Seller → Hub" : "Leg 2 · Hub → Buyer";
  return (
    <div className="px-4 py-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">{leg}</span>
        <span className="text-xs rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
          {shipment.status.replace(/_/g, " ").toLowerCase()}
        </span>
      </div>
      <p className="text-xs text-slate-500">
        {shipment.carrier} {shipment.service}
        {shipment.signatureRequired ? " · signature required" : ""}
      </p>
      {shipment.trackingNumber ? (
        <p className="text-xs text-slate-500 font-mono">{shipment.trackingNumber}</p>
      ) : null}
      {shipment.labelUrl ? (
        <Link
          href={shipment.labelUrl}
          target="_blank"
          className="inline-block mt-1 text-xs font-semibold text-teal-700 hover:underline"
        >
          View / print label →
        </Link>
      ) : null}
    </div>
  );
}

export function ShipmentPanel({ shipments }: { shipments: Shipment[] }) {
  if (shipments.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Shipping
      </div>
      {shipments.map((s) => (
        <Row key={s.id} shipment={s} />
      ))}
    </div>
  );
}

export function ShipDeadline({ deadline, chargeCents }: { deadline: Date | null; chargeCents?: number }) {
  if (!deadline) return null;
  return (
    <p className="text-xs text-amber-700">
      Ship by <strong>{new Date(deadline).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</strong>
      {typeof chargeCents === "number" && chargeCents > 0 ? ` · label charge ${formatCents(chargeCents)}` : ""}
    </p>
  );
}
