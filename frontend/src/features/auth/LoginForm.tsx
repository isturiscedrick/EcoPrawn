"use client";
import { useEffect, useState } from "react";

const errors: Record<string, string> = {
  configuration: "Google sign-in is not configured yet. Contact your administrator.",
  expired: "Your sign-in request expired. Please try again.",
  cancelled: "Google sign-in was cancelled. You can try again.",
  unauthorized: "Please use a verified Google account to sign in.",
  failed: "We could not complete sign-in. Please try again.",
};

export function LoginForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code) setError(errors[code] ?? errors.failed);
    const reset = () => setPending(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);
  return (
    <div className="w-full max-w-[420px]">
      <div className="ep-font-mono mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)]">Facility Access</div>
      <h1 className="ep-font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-[var(--water-deep)]">Welcome back</h1>
      <p className="mt-2 text-[14px] leading-[1.6] text-[rgba(11,35,32,0.6)]">Sign in with your Google account to access the facility dashboard.</p>
      <div className="mt-8 flex flex-col gap-5 rounded-2xl border border-[var(--sand-dim)] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(11,35,32,0.35)] sm:p-7">
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="button" disabled={pending} onClick={() => { setPending(true); window.location.assign("/api/auth/google"); }} className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--sand-dim)] bg-white px-6 py-3 text-[14px] font-semibold text-[var(--water-deep)] hover:bg-[var(--sand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)] disabled:cursor-wait disabled:opacity-60">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.94c4.46-4.13 7.12-10.22 7.12-17.59Z" />
            <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.65-5.94c-2.13 1.43-4.86 2.28-8.25 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
          </svg>
          {pending ? "Connecting to Google…" : "Continue with Google"}
        </button>
      </div>
      <p className="mt-6 text-center text-[12px] text-[rgba(11,35,32,0.5)]">New here? Your first sign-in creates an operator account.</p>
    </div>
  );
}
