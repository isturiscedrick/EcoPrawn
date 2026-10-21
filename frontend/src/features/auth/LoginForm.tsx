"use client";

import { useId, useState } from "react";
import { useLoginForm } from "@/hooks/useLoginForm";

const inputClass =
  "w-full rounded-lg border border-[var(--sand-dim)] bg-white py-3 pl-11 pr-4 text-[14px] text-[var(--water-deep)] outline-none transition-all duration-200 placeholder:text-[rgba(11,35,32,0.35)] hover:border-[rgba(11,35,32,0.25)] focus:border-[var(--coral)] focus:ring-4 focus:ring-[rgba(232,98,58,0.12)]";

const labelClass =
  "ep-font-mono mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.1em] text-[rgba(11,35,32,0.55)]";

export function LoginForm() {
  const { email, setEmail, password, setPassword, handleSubmit } = useLoginForm();
  const uid = useId();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-[420px]">
      <div className="ep-font-mono mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)]">
        Facility Access
      </div>

      <h1 className="ep-font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-[var(--water-deep)]">
        Welcome back
      </h1>
      <p className="mt-2 text-[14px] leading-[1.6] text-[rgba(11,35,32,0.6)]">
        Sign in to access the facility dashboard.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5 rounded-2xl border border-[var(--sand-dim)] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(11,35,32,0.35)] sm:p-7"
      >
        {/* EMAIL */}
        <div>
          <label htmlFor={`${uid}-email`} className={labelClass}>
            Email
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(11,35,32,0.4)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <input
              id={`${uid}-email`}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ecoprawn.io"
              className={inputClass}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor={`${uid}-password`} className="ep-font-mono block text-[10.5px] font-medium uppercase tracking-[0.1em] text-[rgba(11,35,32,0.55)]">
              Password
            </label>
            <a
              href="#"
              className="rounded text-[12px] font-medium text-[var(--coral-dim)] transition-colors hover:text-[var(--coral)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(11,35,32,0.4)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <input
              id={`${uid}-password`}
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[rgba(11,35,32,0.45)] transition-colors hover:bg-[rgba(11,35,32,0.06)] hover:text-[var(--water-deep)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a13 13 0 0 1-2.6 3.4" />
                  <path d="M6.2 6.9C4.1 8.3 2.7 10.4 2.5 12c1 2 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--coral)] px-6 py-3.5 text-[14.5px] font-semibold text-[var(--sand)] shadow-[0_12px_28px_-10px_rgba(232,98,58,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--coral-dim)] hover:shadow-[0_16px_32px_-10px_rgba(232,98,58,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Log in
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[rgba(11,35,32,0.5)]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3z" />
        </svg>
        Access is limited to registered facility operators.
      </div>
    </div>
  );
}