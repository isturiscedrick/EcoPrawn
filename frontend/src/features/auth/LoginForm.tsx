"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type FormEvent,
  type ReactNode,
} from "react";

const errors: Record<string, string> = {
  configuration: "Google sign-in is not configured yet. Contact your administrator.",
  expired: "Your sign-in request expired. Please try again.",
  cancelled: "Google sign-in was cancelled. You can try again.",
  unauthorized: "Please use a verified Google account to sign in.",
  failed: "We could not complete sign-in. Please try again.",
};

// Border/ring colors are kept out of the base so the ok and error states
// never fight over the same CSS property.
const inputBase =
  "w-full rounded-lg border bg-white py-3 pl-11 pr-4 text-[14px] text-[var(--water-deep)] outline-none transition-all duration-200 placeholder:text-[rgba(11,35,32,0.35)]";

const inputOk =
  "border-[var(--sand-dim)] hover:border-[rgba(11,35,32,0.25)] focus:border-[var(--coral)] focus:ring-4 focus:ring-[rgba(232,98,58,0.12)]";

const inputBad =
  "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-4 focus:ring-[rgba(214,69,69,0.15)]";

const labelClass =
  "ep-font-mono mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.1em] text-[rgba(11,35,32,0.55)]";

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

// Shows the error in red when there is one; otherwise the normal grey hint.
// The same id is used for both so aria-describedby always points at it.
function FieldMessage({
  id,
  error,
  children,
}: {
  id: string;
  error?: string;
  children?: ReactNode;
}) {
  if (error) {
    return (
      <span id={id} className="mt-1 block text-[11px] font-medium text-[var(--danger-text)]">
        {error}
      </span>
    );
  }
  return children ? (
    <span id={id} className="mt-1 block text-[11px] text-[var(--mangrove)]">
      {children}
    </span>
  ) : null;
}

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
  const [cooldown, setCooldown] = useState(0);
  const [googlePending, setGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sign up is split in two pages. Page 1: name + username. Page 2: phone + password.
  const onDetailsPage = step === "signup" && signupPage === 1;
  const onContactPage = step === "signup" && signupPage === 2;

  const inputClass = (name: string) => `${inputBase} ${fieldErrors[name] ? inputBad : inputOk}`;

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

  // A fresh form (new step) starts with no field marked as touched.
  useEffect(() => {
    touched.current.clear();
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

  // Move focus to the phone field when the second sign-up page opens.
  useEffect(() => {
    if (step === "signup" && signupPage === 2) {
      formRef.current?.querySelector<HTMLInputElement>('input[name="phone"]')?.focus();
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

  // Validate only the page-1 fields, then reveal page 2. The form is
  // noValidate on page 1, so this is the only validation that runs there.
  function goToContactPage(form: HTMLFormElement) {
    const fields = form.querySelectorAll<HTMLInputElement>(
      'input[name="name"], input[name="username"]'
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

  return (
    <div className="w-full max-w-[420px]">
      <div className="ep-font-mono mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)]">
        Facility Access
      </div>

      <h1 className="ep-font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-[var(--water-deep)]">
        {step === "signup"
          ? "Create your account"
          : step === "verify"
          ? "Verify your phone"
          : step === "complete"
          ? "Choose your username"
          : "Welcome back"}
      </h1>
      <p className="mt-2 text-[14px] leading-[1.6] text-[rgba(11,35,32,0.6)]">
        {onDetailsPage
          ? "Start with your name and a username."
          : onContactPage
          ? "Add your mobile number and a password. We'll text you a code."
          : step === "verify"
          ? "Enter the code from your text message to finish signing up."
          : step === "complete"
          ? "Your phone is verified. Pick an available username to continue."
          : "Sign in with your username or mobile number and password."}
      </p>

      <div className="mt-8 flex flex-col gap-5 rounded-2xl border border-[var(--sand-dim)] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(11,35,32,0.35)] sm:p-7">
        {(step === "signin" || step === "signup") && (
          <div className="flex rounded-lg bg-[var(--sand)] p-1" aria-label="Account access">
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
                className={`flex-1 rounded-md py-2 text-[13px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[var(--coral)] ${
                  step === mode
                    ? "bg-white text-[var(--water-deep)] shadow-sm"
                    : "text-[var(--mangrove)] hover:text-[var(--water-deep)]"
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
            className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/90 p-3 text-[13px] leading-[1.5] text-red-700"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-red-500"
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
            className="flex items-start gap-2.5 rounded-lg border border-[var(--sand-dim)] bg-[var(--sand)]/60 p-3 text-[13px] leading-[1.5] text-[var(--mangrove)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-[var(--mangrove)]"
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
          onInput={updateValidity}
          onBlur={handleBlur}
          noValidate={onDetailsPage}
          aria-busy={pending}
        >
          <fieldset disabled={pending} className="flex flex-col gap-4 disabled:opacity-70">
            {step === "signup" && (
              <div
                aria-live="polite"
                className="ep-font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-[var(--mangrove)]"
              >
                Step {signupPage} of 2
              </div>
            )}

            {step === "signup" && (
              <div className={onContactPage ? "hidden" : undefined}>
                <label htmlFor={`${uid}-name`} className={labelClass}>
                  Full name
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(11,35,32,0.4)]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id={`${uid}-name`}
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    maxLength={100}
                    placeholder="Juan dela Cruz"
                    aria-invalid={fieldErrors.name ? true : undefined}
                    aria-describedby={fieldErrors.name ? `${uid}-name-error` : undefined}
                    className={inputClass("name")}
                  />
                </div>
                <FieldMessage id={`${uid}-name-error`} error={fieldErrors.name} />
              </div>
            )}

            {(step === "signup" || step === "complete") && (
              <div className={onContactPage ? "hidden" : undefined}>
                <label htmlFor={`${uid}-username`} className={labelClass}>
                  Username
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(11,35,32,0.4)]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
                    </svg>
                  </span>
                  <input
                    id={`${uid}-username`}
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    minLength={3}
                    maxLength={30}
                    pattern="[A-Za-z][A-Za-z0-9_]{2,29}"
                    aria-invalid={fieldErrors.username ? true : undefined}
                    aria-describedby={`${uid}-username-help`}
                    placeholder="juan_operator"
                    className={inputClass("username")}
                  />
                </div>
                <FieldMessage id={`${uid}-username-help`} error={fieldErrors.username}>
                  3–30 letters, numbers, or underscores. Start with a letter.
                </FieldMessage>
              </div>
            )}

            {step === "signin" && (
              <div>
                <label htmlFor={`${uid}-identifier`} className={labelClass}>
                  Username or mobile number
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(11,35,32,0.4)]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id={`${uid}-identifier`}
                    name="identifier"
                    type="text"
                    required
                    autoComplete="username"
                    maxLength={40}
                    placeholder="juan_operator or 09171234567"
                    aria-invalid={fieldErrors.identifier ? true : undefined}
                    aria-describedby={fieldErrors.identifier ? `${uid}-identifier-error` : undefined}
                    className={inputClass("identifier")}
                  />
                </div>
                <FieldMessage id={`${uid}-identifier-error`} error={fieldErrors.identifier} />
              </div>
            )}

            {(step === "signup" || step === "verify") && (
              <div className={onDetailsPage ? "hidden" : undefined}>
                <label htmlFor={`${uid}-phone`} className={labelClass}>
                  Mobile number
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(11,35,32,0.4)]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </span>
                  <input
                    id={`${uid}-phone`}
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    maxLength={24}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0917 123 4567"
                    aria-invalid={fieldErrors.phone ? true : undefined}
                    aria-describedby={`${uid}-phone-help`}
                    className={inputClass("phone")}
                  />
                </div>
                <FieldMessage id={`${uid}-phone-help`} error={fieldErrors.phone}>
                  Philippine mobile numbers only (e.g. 0917 123 4567).
                </FieldMessage>
              </div>
            )}

            {(step === "signin" || step === "signup") && (
              <div className={onDetailsPage ? "hidden" : undefined}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor={`${uid}-password`} className={labelClass}>
                    Password
                  </label>
                  {step === "signin" && (
                    <a
                      href="#"
                      className="rounded text-[12px] font-medium text-[var(--coral-dim)] transition-colors hover:text-[var(--coral)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(11,35,32,0.4)]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>
                  <input
                    id={`${uid}-password`}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete={step === "signup" ? "new-password" : "current-password"}
                    minLength={step === "signup" ? 8 : 1}
                    maxLength={128}
                    placeholder="••••••••"
                    aria-invalid={fieldErrors.password ? true : undefined}
                    aria-describedby={step === "signup" ? `${uid}-password-help` : fieldErrors.password ? `${uid}-password-help` : undefined}
                    className={`${inputClass("password")} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[rgba(11,35,32,0.45)] transition-colors hover:bg-[rgba(11,35,32,0.06)] hover:text-[var(--water-deep)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a13 13 0 0 1-2.6 3.4" />
                        <path d="M6.2 6.9C4.1 8.3 2.7 10.4 2.5 12c1 2 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9" />
                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <FieldMessage id={`${uid}-password-help`} error={fieldErrors.password}>
                  {step === "signup" ? "At least 8 characters." : null}
                </FieldMessage>
              </div>
            )}

            {step === "verify" && (
              <div>
                <label htmlFor={`${uid}-code`} className={labelClass}>
                  Verification code
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(11,35,32,0.4)]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>
                  <input
                    id={`${uid}-code`}
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    pattern="[0-9]{6,10}"
                    minLength={6}
                    maxLength={10}
                    placeholder="123456"
                    aria-invalid={fieldErrors.code ? true : undefined}
                    aria-describedby={fieldErrors.code ? `${uid}-code-error` : undefined}
                    className={`${inputClass("code")} tracking-[0.25em]`}
                  />
                </div>
                <FieldMessage id={`${uid}-code-error`} error={fieldErrors.code} />
              </div>
            )}

            <button
              type="submit"
              disabled={pending || !canSubmit}
              className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--coral)] px-6 py-3.5 text-[14.5px] font-semibold text-[var(--sand)] shadow-[0_12px_28px_-10px_rgba(232,98,58,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--coral-dim)] hover:shadow-[0_16px_32px_-10px_rgba(232,98,58,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60"
            >
              {pending
                ? "Please wait…"
                : onDetailsPage
                ? "Continue"
                : onContactPage
                ? "Create account & send code"
                : step === "verify"
                ? "Verify & continue"
                : step === "complete"
                ? "Continue to dashboard"
                : "Sign in"}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </button>

            {onContactPage && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNotice("");
                  // Leaving page 2 blurs its fields first; forget that so an
                  // empty phone isn't already red when the user comes back.
                  touched.current.delete("phone");
                  touched.current.delete("password");
                  setSignupPage(1);
                }}
                className="self-center text-[13px] text-[var(--water-deep)] underline underline-offset-4 transition-colors hover:text-[var(--coral)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
              >
                Back
              </button>
            )}
          </fieldset>
        </form>

        {step === "verify" && (
          <div className="space-y-3 border-t border-[var(--sand-dim)] pt-4 text-center text-sm">
            <p className="text-[13px] text-[var(--mangrove)]">
              Didn't receive your code? Check your number and request a new one.
            </p>
            <button
              type="button"
              disabled={pending || cooldown > 0 || !phone.trim()}
              onClick={() => request({ action: "resend", phone })}
              className="w-full rounded-lg border border-[var(--sand-dim)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--water-deep)] transition-colors hover:bg-[var(--sand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)] disabled:opacity-50"
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
              className="text-[13px] text-[var(--water-deep)] underline underline-offset-4 transition-colors hover:text-[var(--coral)]"
            >
              Back to sign in
            </button>
          </div>
        )}

        {(step === "signin" || onDetailsPage) && (
          <>
            <div className="flex items-center gap-3 text-xs text-[rgba(11,35,32,0.4)]">
              <span className="h-px flex-1 bg-[var(--sand-dim)]" />
              <span className="ep-font-mono uppercase tracking-wider">or</span>
              <span className="h-px flex-1 bg-[var(--sand-dim)]" />
            </div>

            <button
              type="button"
              disabled={pending || googlePending}
              onClick={() => {
                setPending(true);
                setGooglePending(true);
                window.location.assign("/api/auth/google");
              }}
              className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--sand-dim)] bg-white px-6 py-3 text-[14px] font-semibold text-[var(--water-deep)] transition-all hover:bg-[var(--sand)] hover:border-[rgba(11,35,32,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-wait disabled:opacity-60"
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

      <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[rgba(11,35,32,0.5)]">
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