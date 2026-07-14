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
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      <input
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
          readOnly ? "bg-slate-50 text-slate-500" : "bg-white"
        }`}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        readOnly={readOnly}
        step={step}
        min={min}
      />
      {hint ? <span className="block text-xs text-slate-400 mt-1">{hint}</span> : null}
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
      {message}
    </p>
  );
}

export function SuccessNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
      {message}
    </p>
  );
}
