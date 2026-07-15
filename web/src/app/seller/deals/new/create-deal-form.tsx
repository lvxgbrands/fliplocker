"use client";

import { useState, useCallback } from "react";
import { createDealAction } from "../../actions";
import { ErrorNote } from "@/components/form-ui";

const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

interface QuotePreview {
  feeBuyerCents: number;
  feeSellerCents: number;
  shippingCents: number;
  insuranceCents: number;
  taxCents: number;
  buyerTotalCents: number;
  sellerPayoutCents: number;
}

function PhotoInput({
  label,
  file,
  onFile,
}: {
  label: string;
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <label className="block cursor-pointer">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">{label}</span>
      <div
        className={`relative flex items-center justify-center rounded-xl border-2 border-dashed aspect-[3/4] max-h-56 w-full overflow-hidden ${
          file ? "border-brand-400 bg-brand-50/50 shadow-glow" : "border-ink-300 bg-ink-50 hover:border-brand-400 hover:bg-brand-50/30"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="px-4 text-center text-xs font-medium text-ink-400">
            Tap to add photo
            <br />
            (JPG / PNG / WebP)
          </span>
        )}
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onFile(f);
          setPreview(f ? URL.createObjectURL(f) : null);
        }}
      />
      {file ? <span className="mt-1.5 block truncate text-xs font-semibold text-brand-700">{file.name}</span> : null}
    </label>
  );
}

async function uploadViaPresign(file: File): Promise<string> {
  const presign = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!presign.ok) throw new Error("Could not start the photo upload.");
  const { key, url } = await presign.json();
  const put = await fetch(url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!put.ok) throw new Error("Photo upload failed, please try again.");
  return key;
}

export function CreateDealForm({ minSalePriceCents }: { minSalePriceCents: number }) {
  const [front, setFront] = useState<File | null>(null);
  const [rear, setRear] = useState<File | null>(null);
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [quoteNote, setQuoteNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshQuote = useCallback(async (dollars: string) => {
    const cents = Math.round(parseFloat(dollars) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      setQuote(null);
      setQuoteNote(null);
      return;
    }
    const res = await fetch(`/api/quote?priceCents=${cents}`);
    if (res.ok) {
      const json = await res.json();
      setQuote(json.quote);
      setQuoteNote(null);
    } else {
      setQuote(null);
      const json = await res.json().catch(() => null);
      setQuoteNote(
        json?.minSalePriceCents
          ? `Minimum sale price is ${money(json.minSalePriceCents)}.`
          : "Enter a valid price."
      );
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!front || !rear) {
      setError("Both a front and a rear photo of the slab are required.");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const [frontPhotoKey, rearPhotoKey] = await Promise.all([
        uploadViaPresign(front),
        uploadViaPresign(rear),
      ]);
      const result = await createDealAction({
        sport: String(form.get("sport") || ""),
        cardYear: Number(form.get("cardYear")),
        playerName: String(form.get("playerName") || ""),
        gradingCompany: String(form.get("gradingCompany") || ""),
        grade: String(form.get("grade") || ""),
        certNumber: String(form.get("certNumber") || ""),
        description: String(form.get("description") || ""),
        salePriceDollars: Number(form.get("salePrice")),
        buyerEmail: String(form.get("buyerEmail") || ""),
        frontPhotoKey,
        rearPhotoKey,
        frontPhotoType: front.type,
        rearPhotoType: rear.type,
      });
      if (result?.error) {
        setError(result.error);
        setBusy(false);
      }
      // On success the action redirects to the deal page.
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 shadow-[inset_0_1px_2px_rgb(18_55_54/0.04)] transition-colors duration-150 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft">
          <h2 className="text-[15px] font-bold text-ink-900">Card details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">Sport</span>
              <select name="sport" required className={input} defaultValue="Baseball">
                {["Baseball", "Basketball", "Football", "Hockey", "Soccer", "Other"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">Card year</span>
              <input name="cardYear" type="number" min={1900} max={2027} required className={input} placeholder="2018" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">Player</span>
              <input name="playerName" required className={input} placeholder="Walter Johnson" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">Grading company</span>
              <select name="gradingCompany" required className={input} defaultValue="PSA">
                {["PSA", "SGC", "BGS", "CGC", "Other"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">
                Grade <span className="font-normal text-ink-400">(optional)</span>
              </span>
              <input name="grade" className={input} placeholder="PSA 3" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">Certificate / serial #</span>
              <input name="certNumber" required className={input} placeholder="38227911" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">
                Description <span className="font-normal text-ink-400">(optional)</span>
              </span>
              <textarea name="description" rows={3} className={input} placeholder="Anything the buyer should know…" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PhotoInput label="Front photo (slab)" file={front} onFile={setFront} />
            <PhotoInput label="Rear photo (slab)" file={rear} onFile={setRear} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft">
          <h2 className="text-[15px] font-bold text-ink-900">Deal terms</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">Agreed sale price (USD)</span>
              <input
                name="salePrice"
                type="number"
                step="0.01"
                min={minSalePriceCents / 100}
                required
                className={input}
                placeholder={(minSalePriceCents / 100).toFixed(2)}
                onChange={(e) => refreshQuote(e.target.value)}
              />
              <span className="mt-1.5 block text-xs text-ink-400">
                Minimum {money(minSalePriceCents)}
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">Buyer&apos;s email</span>
              <input name="buyerEmail" type="email" required className={input} placeholder="buyer@example.com" />
              <span className="mt-1.5 block text-xs text-ink-400">
                They&apos;ll get a private invitation to review &amp; accept
              </span>
            </label>
          </div>
        </section>

        <ErrorNote message={error ?? undefined} />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-glow active:translate-y-px disabled:opacity-50 sm:w-auto"
        >
          {busy ? "Creating deal…" : "Create deal & invite buyer"}
        </button>
      </div>

      <aside className="h-fit rounded-2xl border border-brand-200/80 bg-gradient-to-b from-brand-50/80 to-white p-5 shadow-soft lg:sticky lg:top-24">
        <h3 className="mb-3 text-[15px] font-bold text-brand-900">Checkout preview</h3>
        {quote ? (
          <dl className="space-y-1.5 text-sm">
            {quote.feeBuyerCents > 0 && <Row label="Buyer service fee" cents={quote.feeBuyerCents} />}
            <Row label="Outbound shipping & signature" cents={quote.shippingCents} />
            {quote.insuranceCents > 0 && <Row label="Declared-value coverage" cents={quote.insuranceCents} />}
            {quote.taxCents > 0 && <Row label="Tax" cents={quote.taxCents} />}
            <div className="my-2 border-t border-brand-200" />
            <Row label="Buyer pays" cents={quote.buyerTotalCents} bold />
            {quote.feeSellerCents > 0 && <Row label="Your service fee share" cents={-quote.feeSellerCents} />}
            <Row label="Your payout on completion" cents={quote.sellerPayoutCents} bold />
          </dl>
        ) : (
          <p className="text-sm text-brand-800/70">{quoteNote ?? "Enter a sale price to preview the numbers."}</p>
        )}
        <p className="mt-4 text-xs leading-relaxed text-brand-800/60">
          The buyer&apos;s payment is held securely by our payment processor and released to you after
          hub documentation and signature-confirmed delivery.
        </p>
      </aside>
    </form>
  );
}

function Row({ label, cents, bold = false }: { label: string; cents: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${bold ? "font-bold text-brand-950" : "text-brand-900/75"}`}>
      <dt>{label}</dt>
      <dd className="font-mono tabular-nums">{money(cents)}</dd>
    </div>
  );
}
