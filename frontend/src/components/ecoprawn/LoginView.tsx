import { useState } from "react";
import { BrandMark } from "./BrandMark";

interface LoginViewProps {
  onLogin: () => void;
  onBackToLanding: () => void;
}

export function LoginView({ onLogin, onBackToLanding }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onLogin();
  }

  return (
    <div
      className="min-h-[92vh] flex items-center justify-center px-6 py-16 text-[var(--sand)]"
      style={{
        background:
          "linear-gradient(180deg, var(--water-mid) 0%, var(--water-deep) 62%, #081E22 100%)",
      }}
    >
      <div className="w-full max-w-[420px]">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2.5 mb-10 mx-auto"
        >
          <BrandMark />
        </button>

        <div className="bg-[rgba(242,235,221,0.05)] border border-[rgba(242,235,221,0.14)] rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="ep-font-display font-semibold text-[26px] tracking-tight mb-1.5 text-center">
            Welcome back
          </h1>
          <p className="text-[13.5px] text-[rgba(242,235,221,0.6)] text-center mb-8">
            Sign in to access the facility dashboard.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="ep-font-mono text-[11px] uppercase tracking-wide text-[rgba(242,235,221,0.55)] block mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ecoprawn.io"
                className="w-full px-4 py-3 rounded-lg bg-[rgba(242,235,221,0.08)] border border-[rgba(242,235,221,0.18)] text-[var(--sand)] placeholder:text-[rgba(242,235,221,0.35)] text-sm outline-none focus:border-[var(--coral)] transition-colors duration-200"
              />
            </div>
            <div>
              <label className="ep-font-mono text-[11px] uppercase tracking-wide text-[rgba(242,235,221,0.55)] block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-[rgba(242,235,221,0.08)] border border-[rgba(242,235,221,0.18)] text-[var(--sand)] placeholder:text-[rgba(242,235,221,0.35)] text-sm outline-none focus:border-[var(--coral)] transition-colors duration-200"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full px-[26px] py-3.5 rounded-lg text-[14.5px] font-semibold bg-[var(--coral)] text-[var(--sand)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--coral-dim)] hover:shadow-[0_12px_28px_-8px_rgba(232,98,58,0.55)]"
            >
              Log in
            </button>
          </form>
        </div>

        <p className="text-center text-[12.5px] text-[rgba(242,235,221,0.45)] mt-6">
          Demo access — enter any email and password to continue.
        </p>
      </div>
    </div>
  );
}