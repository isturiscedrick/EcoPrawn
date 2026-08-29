import { useState } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { BrandMark } from "../components/BrandMark";
import { useView } from "../context/ViewContext";

export function LoginPage() {
  const { setView } = useView();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setView("dashboard");
  }

  return (
    <div className="min-h-screen text-[var(--sand)]">
      <SiteHeader showLinks={false} />
      <div
        className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, var(--water-mid) 0%, var(--water-deep) 62%, #081E22 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(232,98,58,0.3), transparent 70%)" }}
        />

        <div className="relative z-10 w-full max-w-[420px]">
          <div className="mb-6 text-center">
            <span className="ep-font-mono inline-flex items-center gap-2 rounded-full border border-[rgba(242,235,221,0.15)] bg-[rgba(242,235,221,0.05)] px-3.5 py-1.5 text-[10px] tracking-[0.12em] text-[rgba(242,235,221,0.7)]">
              <span className="ep-pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--mangrove-light)]" />
              FACILITY ACCESS
            </span>
          </div>

          <div className="bg-[rgba(242,235,221,0.05)] border border-[rgba(242,235,221,0.14)] rounded-2xl p-8 backdrop-blur-md shadow-[0_30px_70px_-30px_rgba(0,0,0,0.5)]">
            <div className="flex justify-center mb-5">
              <BrandMark size={40} />
            </div>

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
                  className="w-full px-4 py-3 rounded-lg bg-[rgba(242,235,221,0.08)] border border-[rgba(242,235,221,0.18)] text-[var(--sand)] placeholder:text-[rgba(242,235,221,0.35)] text-sm outline-none focus:border-[var(--coral)] focus:bg-[rgba(242,235,221,0.1)] transition-colors duration-200"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="ep-font-mono text-[11px] uppercase tracking-wide text-[rgba(242,235,221,0.55)]">
                    Password
                  </label>
                  <a href="#" className="text-[11px] text-[rgba(242,235,221,0.45)] hover:text-[var(--coral)] transition-colors">
                    Forgot?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg bg-[rgba(242,235,221,0.08)] border border-[rgba(242,235,221,0.18)] text-[var(--sand)] placeholder:text-[rgba(242,235,221,0.35)] text-sm outline-none focus:border-[var(--coral)] focus:bg-[rgba(242,235,221,0.1)] transition-colors duration-200"
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
    </div>
  );
}