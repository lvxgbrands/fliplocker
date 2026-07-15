import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyLabelToken } from "@/lib/shipping";
import { getCheckoutConfig } from "@/lib/config";
import { cardTitle } from "@/lib/deals";

// Renders a simulator shipping label (SHIPPING_MODE=simulator). With EasyPost,
// labelUrl points at EasyPost's own PDF instead and this route isn't used.
export default async function LabelPage({
  params,
  searchParams,
}: {
  params: Promise<{ shipmentId: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { shipmentId } = await params;
  const { t } = await searchParams;
  if (!t || !verifyLabelToken(shipmentId, t)) notFound();

  const shipment = await db.shipment.findUnique({
    where: { id: shipmentId },
    include: { deal: { include: { seller: true } } },
  });
  if (!shipment) notFound();
  const config = await getCheckoutConfig();
  const toHub = shipment.leg === "TO_HUB";

  const from = toHub
    ? { name: shipment.deal.seller.name || "Seller", street: "1 Seller Ave", city: "Dallas", state: "TX", zip: "75201" }
    : { name: config.hubName, street: config.hubStreet, city: config.hubCity, state: config.hubState, zip: config.hubZip };
  const to = toHub
    ? { name: config.hubName, street: config.hubStreet, city: config.hubCity, state: config.hubState, zip: config.hubZip }
    : { name: shipment.deal.buyerEmail, street: "1 Buyer Blvd", city: "Miami", state: "FL", zip: "33101" };

  return (
    <div style={{ background: "#e5e7eb", minHeight: "100vh", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", background: "#fff", border: "2px solid #111", padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #111", padding: "10px 14px" }}>
          <strong style={{ fontSize: 18 }}>USPS {shipment.carrier === "USPS" ? "" : shipment.carrier}</strong>
          <span style={{ fontSize: 12 }}>{shipment.service}</span>
        </div>
        {shipment.signatureRequired && (
          <div style={{ background: "#111", color: "#fff", textAlign: "center", padding: "6px 0", fontWeight: "bold", letterSpacing: 1 }}>
            ✍ SIGNATURE CONFIRMATION REQUIRED
          </div>
        )}
        <div style={{ padding: 14, fontSize: 13, lineHeight: 1.5 }}>
          <div style={{ textTransform: "uppercase", color: "#555", fontSize: 10 }}>From</div>
          <div>{from.name}<br />{from.street}<br />{from.city}, {from.state} {from.zip}</div>
          <div style={{ borderTop: "1px dashed #999", margin: "12px 0" }} />
          <div style={{ textTransform: "uppercase", color: "#555", fontSize: 10 }}>Ship to</div>
          <div style={{ fontSize: 16, fontWeight: "bold" }}>{to.name}<br />{to.street}<br />{to.city}, {to.state} {to.zip}</div>
        </div>
        <div style={{ borderTop: "2px solid #111", padding: 14, textAlign: "center" }}>
          {/* Cosmetic IMpb-style barcode */}
          <div style={{ display: "flex", justifyContent: "center", gap: 1, height: 56, alignItems: "flex-end" }}>
            {shipment.trackingNumber?.split("").map((d, i) => (
              <div key={i} style={{ width: Number(d) % 2 ? 3 : 1.5, height: 56, background: "#111" }} />
            ))}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 14, marginTop: 6, letterSpacing: 1 }}>
            {shipment.trackingNumber?.replace(/(.{4})/g, "$1 ").trim()}
          </div>
        </div>
        <div style={{ borderTop: "1px solid #ccc", padding: "8px 14px", fontSize: 10, color: "#666" }}>
          FlipLocker deal {shipment.deal.shortCode} · {cardTitle(shipment.deal)} · Leg {toHub ? "1 (seller → hub)" : "2 (hub → buyer)"}
        </div>
      </div>
      <p style={{ maxWidth: 460, margin: "12px auto", fontSize: 11, color: "#6b7280", textAlign: "center" }}>
        Simulated label for staging (SHIPPING_MODE=simulator). Print and affix in production once
        the shipping carrier account is connected.
      </p>
    </div>
  );
}
