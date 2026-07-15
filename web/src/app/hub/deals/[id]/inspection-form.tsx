"use client";

import { useState } from "react";
import { submitInspectionAction } from "../../actions";
import { ErrorNote } from "@/components/form-ui";

async function uploadViaPresign(file: File, purpose: "hub-photo" | "hub-video"): Promise<string> {
  const presign = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, purpose }),
  });
  if (!presign.ok) throw new Error("Could not start the upload.");
  const { key, url } = await presign.json();
  const put = await fetch(url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!put.ok) throw new Error("Upload failed, please try again.");
  return key;
}

export function InspectionForm({ dealId }: { dealId: string }) {
  const [video, setVideo] = useState<File | null>(null);
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "PASS" | "FAIL">(null);

  async function submit(result: "PASS" | "FAIL", form: HTMLFormElement) {
    setError(null);
    if (!photo1 || !photo2) {
      setError("Both reference photos are required.");
      return;
    }
    const fd = new FormData(form);
    const tamper = String(fd.get("tamperSealSerial") || "").trim();
    if (!tamper) {
      setError("Enter the tamper-seal serial number.");
      return;
    }
    setBusy(result);
    try {
      const [photo1Key, photo2Key, videoKey] = await Promise.all([
        uploadViaPresign(photo1, "hub-photo"),
        uploadViaPresign(photo2, "hub-photo"),
        video ? uploadViaPresign(video, "hub-video") : Promise.resolve(undefined),
      ]);
      const res = await submitInspectionAction({
        dealId,
        tamperSealSerial: tamper,
        notes: String(fd.get("notes") || ""),
        result,
        videoKey,
        videoType: video?.type,
        photo1Key,
        photo1Type: photo1.type,
        photo2Key,
        photo2Type: photo2.type,
      });
      if (res?.error) {
        setError(res.error);
        setBusy(null);
      } else {
        window.location.reload();
      }
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  const input =
    "w-full rounded-lg border border-ink-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white";

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit("PASS", e.currentTarget);
      }}
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <FileTile label="Inspection video (≤15s)" accept="video/*" file={video} onFile={setVideo} />
        <FileTile label="Reference photo 1" accept="image/*" file={photo1} onFile={setPhoto1} />
        <FileTile label="Reference photo 2" accept="image/*" file={photo2} onFile={setPhoto2} />
      </div>
      <label className="block">
        <span className="block text-sm font-medium text-ink-700 mb-1">Tamper-seal serial number</span>
        <input name="tamperSealSerial" className={input} placeholder="TS-000000" required />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-ink-700 mb-1">
          Notes <span className="text-ink-400 font-normal">(required if flagging a mismatch)</span>
        </span>
        <textarea name="notes" rows={2} className={input} placeholder="Condition observations…" />
      </label>

      <ErrorNote message={error ?? undefined} />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy !== null}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy === "PASS" ? "Submitting…" : "Pass, documented"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={(e) => submit("FAIL", e.currentTarget.form!)}
          className="rounded-lg border border-rose-300 bg-rose-50 px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
        >
          {busy === "FAIL" ? "Submitting…" : "Fail, flag mismatch"}
        </button>
      </div>
    </form>
  );
}

function FileTile({
  label,
  accept,
  file,
  onFile,
}: {
  label: string;
  accept: string;
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  return (
    <label className="block cursor-pointer">
      <span className="block text-xs font-medium text-ink-600 mb-1">{label}</span>
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed aspect-square text-xs text-center px-2 ${
          file ? "border-brand-400 bg-brand-50/50 text-brand-700" : "border-ink-300 bg-ink-50 text-ink-400"
        }`}
      >
        {file ? file.name : "Tap to add"}
      </div>
      <input type="file" accept={accept} className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
    </label>
  );
}
