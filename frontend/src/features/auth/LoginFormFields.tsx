import type { InputHTMLAttributes, ReactNode } from "react";

/* Shared field primitives used by the sign-in and sign-up flow. */
const inputBase =
  "w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-[15px] text-[var(--ep-primary)] outline-none transition-all duration-200 placeholder:text-[var(--ep-text-muted)] placeholder:opacity-60";

const inputOk =
  "border-[var(--ep-line)] hover:border-[var(--ep-accent)] focus:border-[var(--ep-accent)] focus:ring-4 focus:ring-[rgba(178,63,28,0.15)]";

const inputBad =
  "border-[var(--ep-danger)] focus:border-[var(--ep-danger)] focus:ring-4 focus:ring-[rgba(179,38,30,0.15)]";

/* ---------- Icons ---------- */

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const icons = {
  user: (
    <Svg>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  ),
  at: (
    <Svg>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </Svg>
  ),
  phone: (
    <Svg>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </Svg>
  ),
  lock: (
    <Svg>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  ),
  key: (
    <Svg>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  ),
};

/* ---------- Styles (same visual language as the landing and contact pages) ---------- */

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const inputBase =
  "w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-[15px] text-[var(--ep-primary)] outline-none transition-all duration-200 placeholder:text-[var(--ep-text-muted)] placeholder:opacity-60";

const inputOk =
  "border-[var(--ep-line)] hover:border-[var(--ep-accent)] focus:border-[var(--ep-accent)] focus:ring-4 focus:ring-[rgba(178,63,28,0.15)]";

const inputBad =
  "border-[var(--ep-danger)] focus:border-[var(--ep-danger)] focus:ring-4 focus:ring-[rgba(179,38,30,0.15)]";

const labelClass = "mb-1.5 block text-sm font-semibold text-[var(--ep-primary)]";

const outlineButton =
  "w-full rounded-xl border border-[var(--ep-primary)] bg-white px-4 py-2.5 text-[14px] font-semibold text-[var(--ep-primary)] transition-colors duration-200 hover:bg-[rgba(11,46,51,0.04)] disabled:opacity-50 " +
  focusRing;

/* ---------- Small pieces ---------- */

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
function Field({
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
        <label htmlFor={id} className="block text-sm font-semibold text-[var(--ep-primary)]">
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

// Four-segment strength bar. Guidance only: the real rule is still "8+ characters".
function passwordStrength(pw: string): { filled: number; label: string; color: string } {
  if (!pw) return { filled: 0, label: "", color: "" };
  if (pw.length < 8) return { filled: 1, label: "Too short", color: "var(--ep-danger)" };
  const score =
    1 +
    (pw.length >= 12 ? 1 : 0) +
    (/[a-z]/.test(pw) && /[A-Z]/.test(pw) ? 1 : 0) +
    (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  if (score <= 2) return { filled: 2, label: "Okay", color: "var(--amber)" };
  if (score === 3) return { filled: 3, label: "Good", color: "var(--ep-ok)" };
  return { filled: 4, label: "Strong", color: "var(--ep-ok)" };
}

function StrengthMeter({ password }: { password: string }) {
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


