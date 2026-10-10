// Text field sesuai komponen "Text field / Default" di Figma:
// tinggi 44px, radius 15px, border #CBCBCB, teks medium.
// Teks 16px (bukan 14px seperti Figma): iOS otomatis zoom kalau font input < 16px.
export const inputClass = (hasError) =>
  `block h-11 w-full min-w-0 rounded-field border bg-surface px-3 text-base font-medium text-ink placeholder:text-placeholder outline-none transition-colors focus:border-primary ${
    hasError ? "border-danger" : "border-field"
  }`;

export function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs leading-4 font-semibold text-subtle">
      {children}
    </label>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-danger">{children}</p>;
}

export default function Field({ label, id, error, prefix, right, className = "", ...inputProps }) {
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-subtle">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={`${inputClass(error)} ${prefix ? "pl-10" : ""} ${right ? "pr-11" : ""} ${className}`}
          {...inputProps}
        />
        {right && <div className="absolute top-1/2 right-1.5 -translate-y-1/2">{right}</div>}
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
}
