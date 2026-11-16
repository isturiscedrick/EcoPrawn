import type { InputHTMLAttributes, ReactNode } from "react";
import { passwordStrength } from "./auth-form-utils";

const inputBase =
  "w-full rounded-xl border bg-[var(--ep-bg)] py-3 pl-11 pr-4 text-[15px] text-[var(--ep-text)] outline-none transition-all duration-200 placeholder:text-[var(--ep-text-muted)] placeholder:opacity-70";

const inputOk =
  "border-[var(--ep-line)] hover:border-[var(--ep-accent)] focus:border-[var(--ep-accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--ep-accent)_18%,transparent)]";

const inputBad =
  "border-[var(--ep-danger)] focus:border-[var(--ep-danger)] focus:ring-4 focus:ring-[rgba(179,38,30,0.15)]";


/** Shared accessible label, icon, input, hint, and validation presentation. */
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: ReactNode;
  error?: string;
  hint?: ReactNode;
  labelAside?: ReactNode;
  trailing?: ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
  children?: ReactNode;
}

// Label + icon + input + message. The message uses one id for both the hint
// and the error so aria-describedby always points at whatever is showing.
export function Field({
  id,
  label,
  icon,
  error,
  hint,
  labelAside,
  trailing,
  wrapperClassName,
  inputClassName = "",
  children,
  ...inputProps
}: FieldProps) {
  const helpId = `${id}-help`;
  const hasMessage = Boolean(error || hint);
  return (
    <div className={wrapperClassName}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-semibold text-[var(--ep-text)]">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ep-text-muted)]"
        >
          {icon}
        </span>
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? helpId : undefined}
          className={`${inputBase} ${error ? inputBad : inputOk} ${inputClassName}`}
          {...inputProps}
        />
        {trailing}
      </div>
      {children}
      {error ? (
        <span id={helpId} className="mt-1.5 block text-[13px] font-semibold text-[var(--ep-danger)]">
          {error}
        </span>
      ) : hint ? (
        <span id={helpId} className="mt-1.5 block text-[13px] text-[var(--ep-text-muted)]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function StrengthMeter({ password }: { password: string }) {
  const s = passwordStrength(password);
  return (
    <div className="mt-2.5" aria-live="polite">
      <div aria-hidden="true" className="flex gap-1.5">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className="h-1.5 flex-1 rounded-full transition-colors duration-200"
            style={{ background: n <= s.filled ? s.color : "var(--ep-line)" }}
          />
        ))}
      </div>
      <span className="sr-only">{s.label ? `Password strength: ${s.label}` : ""}</span>
      {s.label && (
        <div aria-hidden="true" className="mt-1 text-[13px] font-semibold text-[var(--ep-text-muted)]">
          {s.label}
        </div>
      )}
    </div>
  );
}

