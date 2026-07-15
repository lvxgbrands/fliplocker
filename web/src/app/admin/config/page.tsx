import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ErrorNote, SuccessNote } from "@/components/form-ui";
import { updateFeeConfigAction, updateCheckoutConfigAction, upsertTaxRateAction } from "../actions";

const d = (cents: number) => (cents / 100).toFixed(2);
const pct = (bps: number) => (bps / 100).toString();

export default async function AdminConfig({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireUser("ADMIN");
  const { saved, error } = await searchParams;

  const [fees, checkout, taxes] = await Promise.all([
    db.feeConfig.findMany({ orderBy: { plan: "asc" } }),
    db.checkoutConfig.findUniqueOrThrow({ where: { id: "default" } }),
    db.taxRate.findMany({ where: { configId: "default" }, orderBy: { state: "asc" } }),
  ]);

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white";

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Fees &amp; configuration</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every checkout number lives here — edit it without a code change. Fees depend on sale
          price only; the card&apos;s market value is never used.
        </p>
      </div>

      {saved ? <SuccessNote message="Saved." /> : null}
      <ErrorNote message={error} />

      <section>
        <h2 className="font-semibold mb-3">Service fee by plan</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {fees.map((f) => (
            <form key={f.plan} action={updateFeeConfigAction} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <input type="hidden" name="plan" value={f.plan} />
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{f.plan}</h3>
                <span className="text-xs text-slate-400">plan tier</span>
              </div>
              <Labeled label="Flat floor ($, below crossover)">
                <input name="floorDollars" type="number" step="0.01" defaultValue={d(f.floorCents)} className={input} />
              </Labeled>
              <Labeled label="Percent (%, at/above crossover)">
                <input name="percent" type="number" step="0.01" defaultValue={pct(f.percentBps)} className={input} />
              </Labeled>
              <Labeled label="Crossover price ($)">
                <input name="crossoverDollars" type="number" step="0.01" defaultValue={d(f.crossoverPriceCents)} className={input} />
              </Labeled>
              <Labeled label="Who pays the fee">
                <select name="whoPays" defaultValue={f.whoPays} className={input}>
                  <option value="BUYER">Buyer</option>
                  <option value="SELLER">Seller</option>
                  <option value="SPLIT">Split 50/50</option>
                </select>
              </Labeled>
              <button className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
                Save {f.plan}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Checkout &amp; logistics</h2>
        <form action={updateCheckoutConfigAction} className="rounded-2xl border border-slate-200 bg-white p-4 grid sm:grid-cols-2 gap-4">
          <Labeled label="Minimum sale price ($)">
            <input name="minDollars" type="number" step="0.01" defaultValue={d(checkout.minSalePriceCents)} className={input} />
          </Labeled>
          <Labeled label="Outbound shipping & signature ($)">
            <input name="shippingDollars" type="number" step="0.01" defaultValue={d(checkout.outboundShippingCents)} className={input} />
          </Labeled>
          <Labeled label="Insurance per $100 ($)">
            <input name="insurancePer100Dollars" type="number" step="0.01" defaultValue={d(checkout.insuranceCentsPer100)} className={input} />
          </Labeled>
          <Labeled label="Seller Leg 1 label charge ($)">
            <input name="labelChargeDollars" type="number" step="0.01" defaultValue={d(checkout.sellerLabelChargeCents)} className={input} />
          </Labeled>
          <Labeled label="Default tax (%, when no state rule)">
            <input name="defaultTaxPercent" type="number" step="0.01" defaultValue={pct(checkout.defaultTaxBps)} className={input} />
          </Labeled>
          <div className="flex items-end gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="insuranceEnabled" defaultChecked={checkout.insuranceEnabled} /> Insurance on</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="taxEnabled" defaultChecked={checkout.taxEnabled} /> Tax on</label>
          </div>
          <Labeled label="Ship timer (hours)">
            <input name="shipTimerHours" type="number" defaultValue={checkout.shipTimerHours} className={input} />
          </Labeled>
          <Labeled label="Review window (hours)">
            <input name="reviewWindowHours" type="number" defaultValue={checkout.reviewWindowHours} className={input} />
          </Labeled>
          <div className="sm:col-span-2 border-t border-slate-100 pt-3 grid sm:grid-cols-2 gap-4">
            <Labeled label="Hub name"><input name="hubName" defaultValue={checkout.hubName} className={input} /></Labeled>
            <Labeled label="Hub street"><input name="hubStreet" defaultValue={checkout.hubStreet} className={input} /></Labeled>
            <Labeled label="Hub city"><input name="hubCity" defaultValue={checkout.hubCity} className={input} /></Labeled>
            <div className="grid grid-cols-2 gap-2">
              <Labeled label="State"><input name="hubState" maxLength={2} defaultValue={checkout.hubState} className={input} /></Labeled>
              <Labeled label="ZIP"><input name="hubZip" defaultValue={checkout.hubZip} className={input} /></Labeled>
            </div>
          </div>
          <div className="sm:col-span-2">
            <button className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700">Save checkout config</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Per-state tax rates</h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          {taxes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {taxes.map((t) => (
                <span key={t.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm">
                  {t.state}: {pct(t.rateBps)}%
                </span>
              ))}
            </div>
          )}
          <form action={upsertTaxRateAction} className="flex gap-2 items-end">
            <Labeled label="State"><input name="state" maxLength={2} placeholder="TX" className={`${input} w-24`} /></Labeled>
            <Labeled label="Rate (%)"><input name="percent" type="number" step="0.01" placeholder="8.25" className={`${input} w-28`} /></Labeled>
            <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900">Add / update</button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
