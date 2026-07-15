"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { newsletterAction, type FormState } from "@/lib/marketing-actions";

const INITIAL: FormState = { status: "idle", message: "" };

function SubmitButton({ dark }: { dark: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-60 ${
        dark
          ? "bg-brand-500 text-white hover:bg-brand-400"
          : "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-soft hover:shadow-glow"
      }`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Joining
        </>
      ) : (
        <>
          Subscribe <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}

export function NewsletterForm({
  source = "footer",
  dark = false,
  placeholder = "you@email.com",
  compact = false,
}: {
  source?: string;
  dark?: boolean;
  placeholder?: string;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(newsletterAction, INITIAL);
  const id = useId();
  const done = state.status === "success" || state.status === "info";

  return (
    <div>
      <form action={formAction} className={`flex gap-2 ${compact ? "" : "flex-col sm:flex-row"}`}>
        <input type="hidden" name="source" value={source} />
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />
        <label htmlFor={`nl-${id}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${id}`}
          type="email"
          name="email"
          required
          placeholder={placeholder}
          autoComplete="email"
          aria-describedby={state.message ? `nl-msg-${id}` : undefined}
          className={`w-full min-w-0 flex-1 rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-4 ${
            dark
              ? "border-white/15 bg-white/5 text-white placeholder:text-brand-100/40 focus:border-brand-400 focus:ring-brand-500/20"
              : "border-ink-200 bg-white text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:ring-brand-500/15"
          }`}
        />
        <SubmitButton dark={dark} />
      </form>
      {state.message ? (
        <p
          id={`nl-msg-${id}`}
          role="status"
          aria-live="polite"
          className={`mt-2 flex items-center gap-1.5 text-xs ${
            state.status === "error"
              ? "text-rose-500"
              : dark
                ? "text-brand-200"
                : "text-brand-700"
          }`}
        >
          {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> : null}
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
