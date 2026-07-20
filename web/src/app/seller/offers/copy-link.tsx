"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLink({ url, compact = false }: { url: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked; the field is still selectable for a manual copy.
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2.2} />}
        {copied ? "Copied" : "Copy link"}
      </button>
    );
  }

  return (
    <div className="flex items-stretch gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 font-mono text-xs text-ink-600"
      />
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-b from-brand-500 to-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-soft transition-all hover:from-brand-600 hover:to-brand-700"
      >
        {copied ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Copy className="h-4 w-4" strokeWidth={2.2} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
