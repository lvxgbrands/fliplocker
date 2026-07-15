import { AlertCircle, CheckCircle2 } from "lucide-react";
import { inputClass } from "@/components/ui";

export function Field({
  label,
  name,
  type = "text",
  required = true,
  placeholder,
  defaultValue,
  readOnly = false,
  step,
  min,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number;
  readOnly?: boolean;
  step?: string;
  min?: string | number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">{label}</span>
      <input
        className={`${inputClass} ${readOnly ? "bg-ink-50 text-ink-400" : ""}`}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        readOnly={readOnly}
        step={step}
        min={min}
      />
      {hint ? <span className="mt-1.5 block text-xs text-ink-400">{hint}</span> : null}
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-glow active:translate-y-px disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
      {message}
    </p>
  );
}

export function SuccessNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
      {message}
    </p>
  );
}
