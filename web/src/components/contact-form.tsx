"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { inputClass } from "@/components/ui";
import { contactAction, type FormState } from "@/lib/marketing-actions";

const INITIAL: FormState = { status: "idle", message: "" };
const TOPICS = ["General question", "Selling a card", "Buying a card", "A specific deal", "Press & partnerships", "Something else"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-glow disabled:opacity-60 sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Sending
        </>
      ) : (
        <>
          Send message <Send className="h-4 w-4" strokeWidth={2.4} />
        </>
      )}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(contactAction, INITIAL);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-win-500/30 bg-win-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-win-600" strokeWidth={1.8} />
        <h3 className="mt-3 text-lg font-bold text-ink-900">Message sent</h3>
        <p className="mt-1.5 text-sm text-ink-600">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-sm font-semibold text-ink-700">
            Name
          </label>
          <input id="c-name" name="name" required autoComplete="name" className={inputClass} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="c-email" className="mb-1.5 block text-sm font-semibold text-ink-700">
            Email
          </label>
          <input id="c-email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@email.com" />
        </div>
      </div>

      <div>
        <label htmlFor="c-topic" className="mb-1.5 block text-sm font-semibold text-ink-700">
          Topic
        </label>
        <select id="c-topic" name="topic" className={inputClass} defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="c-message" className="mb-1.5 block text-sm font-semibold text-ink-700">
          Message
        </label>
        <textarea
          id="c-message"
          name="message"
          required
          rows={5}
          className={`${inputClass} resize-y`}
          placeholder="How can we help? Include a deal short code if it's about a specific deal."
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-ink-600">
        <input type="checkbox" name="newsletter" className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
        Also send me the occasional FlipLocker newsletter.
      </label>

      {state.status === "error" ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" /> {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
