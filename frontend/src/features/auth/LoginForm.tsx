"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

const errors: Record<string, string> = {
  configuration: "Google sign-in is not configured yet. Contact your administrator.",
  expired: "Your sign-in request expired. Please try again.",
  cancelled: "Google sign-in was cancelled. You can try again.",
  unauthorized: "Please use a verified Google account to sign in.",
  failed: "We could not complete sign-in. Please try again.",
};

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
  "w-full rounded-xl border-2 bg-white py-3 pl-11 pr-4 text-[15px] text-[var(--ep-primary)] outline-none transition-all duration-200 placeholder:text-[var(--ep-text-muted)] placeholder:opacity-60";

const inputOk =
  "border-[var(--ep-primary)] hover:border-[var(--ep-accent)] focus:border-[var(--ep-accent)] focus:ring-4 focus:ring-[rgba(178,63,28,0.15)]";

const inputBad =
  "border-[var(--ep-danger)] focus:border-[var(--ep-danger)] focus:ring-4 focus:ring-[rgba(179,38,30,0.15)]";

const labelClass = "mb-1.5 block text-sm font-semibold text-[var(--ep-primary)]";

const outlineButton =
  "w-full rounded-xl border-2 border-[var(--ep-primary)] bg-white px-4 py-2.5 text-[14px] font-semibold text-[var(--ep-primary)] transition-colors duration-200 hover:bg-[var(--ep-tint)] disabled:opacity-50 " +
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

// Turns the browser's validity state into a short message for one field.
function messageFor(input: HTMLInputElement): string {
  const v = input.validity;
  if (v.valid) return "";
  switch (input.name) {
    case "name":
      return "Enter your full name.";
    case "username":
      return v.valueMissing
        ? "Choose a username."
        : "Use 3–30 letters, numbers, or underscores, starting with a letter.";
    case "identifier":
      return "Enter your username or mobile number.";
    case "phone":
      return "Enter your mobile number.";
    case "password":
      if (v.valueMissing) {
        return input.autocomplete === "new-password" ? "Enter a password." : "Enter your password.";
      }
      return "Use at least 8 characters.";
    case "code":
      return v.valueMissing ? "Enter the code from your text message." : "The code is 6–10 digits.";
    default:
      return input.validationMessage;
  }
}

const SIGNUP_STEPS = ["Your details", "Account"] as const;

/* ---------- The form ---------- */

export function LoginForm() {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const touched = useRef<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState<"signin" | "signup" | "verify" | "complete">("signin");
  const [signupPage, setSignupPage] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [googlePending, setGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sign up is split in two pages. Page 1: full name + mobile number.
  // Page 2: username + password.
  const onDetailsPage = step === "signup" && signupPage === 1;
  const onContactPage = step === "signup" && signupPage === 2;

  // Recomputes two things from the live DOM: whether the submit button can be
  // enabled, and which touched fields currently have an error. Fields on the
  // hidden sign-up page are skipped so they don't block or show errors.
  const updateValidity = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const visible = Array.from(form.querySelectorAll<HTMLInputElement>("input")).filter(
      (input) => !input.closest(".hidden")
    );
    setCanSubmit(visible.every((input) => input.checkValidity()));

    const next: Record<string, string> = {};
    for (const input of visible) {
      if (!touched.current.has(input.name)) continue;
      const message = messageFor(input);
      if (message) next[input.name] = message;
    }
    setFieldErrors((prev) => {
      const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
      for (const key of keys) if (prev[key] !== next[key]) return next;
      return prev;
    });
  }, []);

  // A fresh form (new step) starts with no field marked as touched and no password.
  useEffect(() => {
    touched.current.clear();
    setPassword("");
  }, [step]);

  // Re-check after the form remounts (step change), the page flips, or the
  // controlled phone value changes (e.g. prefilled on the verify step).
  useEffect(() => {
    updateValidity();
  }, [step, signupPage, phone, updateValidity]);

  // A field counts as touched once the user leaves it. React's onBlur bubbles,
  // so one handler on the form covers every input.
  function handleBlur(event: ReactFocusEvent<HTMLFormElement>) {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.name) {
      touched.current.add(target.name);
      updateValidity();
    }
  }

  function handleInput(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.name === "password") {
      setPassword(target.value);
    }
    updateValidity();
  }

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code) setError(errors[code] ?? errors.failed);
    const reset = () => {
      setPending(false);
      setGooglePending(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  // Move focus to the username field when the second sign-up page opens.
  useEffect(() => {
    if (step === "signup" && signupPage === 2) {
      formRef.current?.querySelector<HTMLInputElement>('input[name="username"]')?.focus();
    }
  }, [step, signupPage]);

  async function request(values: Record<string, unknown>) {
    setError("");
    setNotice("");
    setPending(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.complete) {
        setStep("complete");
        setError(data.error || "Please choose a username to continue.");
        return;
      }
      if (data.verify) {
        const number = data.phone || values.phone || values.identifier;
        setPhone(typeof number === "string" ? number : "");
        setStep("verify");
        setCooldown(response.ok ? 60 : 0);
        setNotice(
          response.ok
            ? "We sent a verification code to your phone."
            : "Enter your phone number and request a code to verify your account."
        );
        return;
      }
      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      if (values.action === "resend") {
        setCooldown(60);
        setNotice("A new code has been sent.");
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setError("Could not connect. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  // Validate only the page-1 fields (full name + mobile number), then reveal
  // page 2. The form is noValidate on page 1, so this is the only validation
  // that runs there.
  function goToContactPage(form: HTMLFormElement) {
    const fields = form.querySelectorAll<HTMLInputElement>(
      'input[name="name"], input[name="phone"]'
    );
    for (const field of Array.from(fields)) {
      if (!field.reportValidity()) return;
    }
    setError("");
    setNotice("");
    setSignupPage(2);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (onDetailsPage) {
      goToContactPage(event.currentTarget);
      return;
    }
    await request({
      ...Object.fromEntries(new FormData(event.currentTarget)),
      action: step,
      ...(step === "verify" ? { phone } : {}),
    });
  }

  const submitLabel = pending
    ? "Please wait…"
    : onDetailsPage
    ? "Continue"
    : onContactPage
    ? "Create account and send code"
    : step === "verify"
    ? "Verify and continue"
    : step === "complete"
    ? "Continue to dashboard"
    : "Sign in";

  return (
    <div className="w-full max-w-[420px]">
      <h1 className="ep-font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-[var(--ep-primary)]">
        {step === "signup"
          ? "Create your account"
          : step === "verify"
          ? "Verify your phone"
          : step === "complete"
          ? "Choose your username"
          : "Welcome back"}
      </h1>
      <p className="mt-2 text-[15px] leading-[1.6] text-[var(--ep-text-muted)]">
        {onDetailsPage
          ? "Start with your name and mobile number."
          : onContactPage
          ? "Choose a username and a password. We'll text a code to your mobile number."
          : step === "verify"
          ? "Enter the code from your text message to finish signing up."
          : step === "complete"
          ? "Your phone is verified. Pick an available username to continue."
          : "Sign in with your username or mobile number and password."}
      </p>

      <div className="mt-8 flex flex-col gap-5 rounded-2xl border-2 border-[var(--ep-primary)] bg-white p-6 shadow-[8px_8px_0_0_var(--ep-accent)] sm:p-7">
        {(step === "signin" || step === "signup") && (
          <div
            role="group"
            aria-label="Account access"
            className="grid grid-cols-2 gap-1 rounded-xl border-2 border-[var(--ep-primary)] bg-[var(--ep-tint)] p-1"
          >
            {(["signin", "signup"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={step === mode}
                disabled={pending}
                onClick={() => {
                  setStep(mode);
                  setSignupPage(1);
                  setError("");
                  setNotice("");
                }}
                className={`rounded-lg py-2 text-[14px] font-semibold transition-colors duration-200 ${focusRing} ${
                  step === mode
                    ? "bg-[var(--ep-primary)] text-[var(--ep-bg)]"
                    : "text-[var(--ep-primary)] hover:bg-white"
                }`}
              >
                {mode === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border-2 border-[var(--ep-danger)] bg-white p-3 text-[14px] font-medium leading-[1.5] text-[var(--ep-danger)]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl border-2 border-[var(--ep-ok)] bg-white p-3 text-[14px] font-medium leading-[1.5] text-[var(--ep-ok)]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{notice}</span>
          </div>
        )}

        <form
          key={step}
          ref={formRef}
          onSubmit={submit}
          onInput={handleInput}
          onBlur={handleBlur}
          noValidate={onDetailsPage}
          aria-busy={pending}
        >
          <fieldset disabled={pending} className="flex flex-col gap-4 disabled:opacity-70">
            {step === "signup" && (
              <div aria-live="polite">
                <span className="sr-only">
                  Step {signupPage} of 2: {SIGNUP_STEPS[signupPage - 1]}
                </span>
                <div aria-hidden="true" className="flex gap-2">
                  {SIGNUP_STEPS.map((label, i) => (
                    <div key={label} className="flex-1">
                      <div
                        className={`h-1.5 rounded-full transition-colors duration-300 ${
                          signupPage >= i + 1 ? "bg-[var(--ep-accent)]" : "bg-[var(--ep-line)]"
                        }`}
                      />
                      <div
                        className={`mt-1.5 text-[13px] font-semibold ${
                          signupPage === i + 1
                            ? "text-[var(--ep-primary)]"
                            : "text-[var(--ep-text-muted)]"
                        }`}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signup page 1: full name */}
            {step === "signup" && (
              <Field
                id={`${uid}-name`}
                name="name"
                type="text"
                label="Full name"
                icon={icons.user}
                required
                autoComplete="name"
                maxLength={100}
                placeholder="Juan dela Cruz"
                error={fieldErrors.name}
                wrapperClassName={onContactPage ? "hidden" : undefined}
              />
            )}

            {/* Signup page 2 (and the "complete" step): username */}
            {(step === "signup" || step === "complete") && (
              <Field
                id={`${uid}-username`}
                name="username"
                type="text"
                label="Username"
                icon={icons.at}
                required
                autoComplete="username"
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z][A-Za-z0-9_]{2,29}"
                placeholder="juan_operator"
                error={fieldErrors.username}
                hint="3–30 letters, numbers, or underscores. Start with a letter."
                wrapperClassName={onDetailsPage ? "hidden" : undefined}
              />
            )}

            {step === "signin" && (
              <Field
                id={`${uid}-identifier`}
                name="identifier"
                type="text"
                label="Username or mobile number"
                icon={icons.user}
                required
                autoComplete="username"
                maxLength={40}
                placeholder="juan_operator or 09171234567"
                error={fieldErrors.identifier}
              />
            )}

            {/* Signup page 1 (and the verify step): mobile number */}
            {(step === "signup" || step === "verify") && (
              <Field
                id={`${uid}-phone`}
                name="phone"
                type="tel"
                label="Mobile number"
                icon={icons.phone}
                required
                autoComplete="tel"
                maxLength={24}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0917 123 4567"
                error={fieldErrors.phone}
                hint="Philippine mobile numbers only (e.g. 0917 123 4567)."
                wrapperClassName={onContactPage ? "hidden" : undefined}
              />
            )}

            {/* Signin and signup page 2: password */}
            {(step === "signin" || step === "signup") && (
              <Field
                id={`${uid}-password`}
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                icon={icons.lock}
                required
                autoComplete={step === "signup" ? "new-password" : "current-password"}
                minLength={step === "signup" ? 8 : 1}
                maxLength={128}
                placeholder="••••••••"
                error={fieldErrors.password}
                hint={step === "signup" ? "At least 8 characters." : undefined}
                inputClassName="pr-12"
                wrapperClassName={onDetailsPage ? "hidden" : undefined}
                labelAside={
                  step === "signin" ? (
                    <a
                      href="#"
                      className="rounded text-[13px] font-semibold text-[var(--ep-accent)] underline-offset-4 transition-colors hover:text-[var(--ep-accent-hover)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)]"
                    >
                      Forgot password?
                    </a>
                  ) : undefined
                }
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]"
                    style={{ minHeight: 0 }}
                  >
                    {showPassword ? (
                      <Svg>
                        <path d="M3 3l18 18" />
                        <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a13 13 0 0 1-2.6 3.4" />
                        <path d="M6.2 6.9C4.1 8.3 2.7 10.4 2.5 12c1 2 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9" />
                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                      </Svg>
                    ) : (
                      <Svg>
                        <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" />
                        <circle cx="12" cy="12" r="3" />
                      </Svg>
                    )
                    }
                  </button>
                }
              >
                {step === "signup" && <StrengthMeter password={password} />}
              </Field>
            )}

            {step === "verify" && (
              <Field
                id={`${uid}-code`}
                name="code"
                type="text"
                inputMode="numeric"
                label="Verification code"
                icon={icons.key}
                autoComplete="one-time-code"
                required
                pattern="[0-9]{6,10}"
                minLength={6}
                maxLength={10}
                placeholder="123456"
                error={fieldErrors.code}
                inputClassName="text-center text-[22px] font-semibold tracking-[0.35em] placeholder:tracking-[0.35em]"
              />
            )}

            <button
              type="submit"
              disabled={pending || !canSubmit}
              className={`group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--ep-accent)] bg-[var(--ep-accent)] px-6 py-3.5 text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-accent-hover)] hover:bg-[var(--ep-accent-hover)] hover:shadow-[0_10px_24px_-12px_rgba(11,46,51,0.6)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`}
            >
              {pending && (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent motion-reduce:animate-none"
                />
              )}
              {submitLabel}
              {!pending && (
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              )}
            </button>

            {onContactPage && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNotice("");
                  // Leaving page 2 blurs its fields first; forget that so an
                  // empty username isn't already red when the user comes back.
                  touched.current.delete("username");
                  touched.current.delete("password");
                  setSignupPage(1);
                }}
                className="self-center rounded text-[14px] font-semibold text-[var(--ep-primary)] underline underline-offset-4 transition-colors hover:text-[var(--ep-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]"
              >
                Back
              </button>
            )}
          </fieldset>
        </form>

        {step === "verify" && (
          <div className="flex flex-col gap-3 border-t-2 border-[var(--ep-line)] pt-4 text-center">
            <p className="text-[14px] text-[var(--ep-text-muted)]">
              Didn&apos;t receive your code? Check your number and request a new one.
            </p>
            <button
              type="button"
              disabled={pending || cooldown > 0 || !phone.trim()}
              onClick={() => request({ action: "resend", phone })}
              className={outlineButton}
            >
              {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setStep("signin");
                setSignupPage(1);
                setError("");
                setNotice("");
              }}
              className="self-center rounded text-[14px] font-semibold text-[var(--ep-primary)] underline underline-offset-4 transition-colors hover:text-[var(--ep-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]"
            >
              Back to sign in
            </button>
          </div>
        )}

        {(step === "signin" || onDetailsPage) && (
          <>
            <div className="flex items-center gap-3 text-sm font-semibold text-[var(--ep-text-muted)]">
              <span className="h-0.5 flex-1 bg-[var(--ep-line)]" />
              or
              <span className="h-0.5 flex-1 bg-[var(--ep-line)]" />
            </div>

            <button
              type="button"
              disabled={pending || googlePending}
              onClick={() => {
                setPending(true);
                setGooglePending(true);
                window.location.assign("/api/auth/google");
              }}
              className={`inline-flex w-full items-center justify-center gap-3 rounded-xl border-2 border-[var(--ep-primary)] bg-white px-6 py-3 text-[15px] font-semibold text-[var(--ep-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--ep-tint)] active:translate-y-0 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.94c4.46-4.13 7.12-10.22 7.12-17.59Z" />
                <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.65-5.94c-2.13 1.43-4.86 2.28-8.25 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
              </svg>
              {googlePending ? "Connecting to Google…" : "Continue with Google"}
            </button>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-[var(--ep-text-muted)]">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3z" />
        </svg>
        {step === "signin"
          ? "Access is limited to registered facility operators."
          : "New accounts receive operator access."}
      </div>
    </div>
  );
}