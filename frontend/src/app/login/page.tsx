"use client";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LoginForm } from "@/features/auth/LoginForm";
import { heroReadoutUnits } from "@/config/sensors";
import { useDemoData } from "@/hooks/useDemoData";

const HIGHLIGHTS = [
  { title: "Live water quality", body: "DO, pH, temperature, salinity and level, tracked around the clock." },
  { title: "AI growth tracking", body: "Biomass and behavior estimated from camera feeds, no handling needed." },
  { title: "Automated control", body: "Aerators and feeding react the moment a parameter crosses its limit." },
];

export default function LoginPage() {
  const {heroReadouts}=useDemoData();
  return (
    <div className="min-h-screen bg-[var(--sand)]">
     <SiteHeader showLinks={false} variant="auth" />

      <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[1.05fr_1fr]">
        {/* BRAND PANEL (desktop only) */}
        <aside
          className="relative hidden flex-col justify-between overflow-hidden px-12 py-14 text-[var(--sand)] lg:flex xl:px-16"
          style={{
            background:
              "linear-gradient(180deg, var(--water-mid) 0%, var(--water-deep) 62%, #081E22 100%)",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(232,98,58,0.3), transparent 70%)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-24 h-[380px] w-[380px] rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(126,173,135,0.25), transparent 70%)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(242,235,221,1) 1px, transparent 1px), linear-gradient(90deg, rgba(242,235,221,1) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />

          <div className="relative z-10 max-w-[520px]">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[rgba(242,235,221,0.15)] bg-[rgba(242,235,221,0.05)] px-3.5 py-2">
              <span className="ep-pulse-dot h-[7px] w-[7px] rounded-full bg-[var(--mangrove-light)] shadow-[0_0_10px_rgba(126,173,135,0.7)]" />
              <span className="ep-font-mono text-[10.5px] tracking-[0.13em] text-[rgba(242,235,221,0.78)]">
                SYSTEM ONLINE
              </span>
            </div>

            <h2 className="ep-font-display text-[clamp(34px,3.6vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Your tanks,
              <br />
              <em className="font-medium italic text-[var(--coral)]">always in range.</em>
            </h2>

            <p className="mt-5 text-[15px] leading-[1.65] text-[rgba(242,235,221,0.72)]">
              Sign in to monitor water quality, feeding, and shrimp growth across the
              EcoPrawn facility from a single dashboard.
            </p>

            <ul className="mt-9 flex flex-col gap-5">
              {HIGHLIGHTS.map((h) => (
                <li key={h.title} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[rgba(232,98,58,0.16)] text-[12px] text-[var(--coral)]"
                  >
                    ✓
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold text-[var(--sand)]">{h.title}</div>
                    <div className="mt-0.5 text-[13px] leading-[1.55] text-[rgba(242,235,221,0.6)]">
                      {h.body}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Live readings strip */}
          <div className="relative z-10 mt-12 border-t border-[rgba(242,235,221,0.16)] pt-6">
            <div className="ep-font-mono mb-3 text-[9.5px] uppercase tracking-[0.14em] text-[rgba(242,235,221,0.45)]">
              Tank 1 · latest readings
            </div>
            <div className="grid grid-cols-5 gap-3">
              {heroReadouts.map((r) => (
                <div key={r.label}>
                  <div className="ep-font-mono text-[8.5px] uppercase leading-tight tracking-[0.08em] text-[rgba(242,235,221,0.5)]">
                    {r.label}
                  </div>
                  <div className="ep-font-mono mt-1.5 text-[18px] font-semibold text-[var(--sand)]">
                    {r.value}
                    <span className="ml-0.5 text-[9.5px] font-normal text-[rgba(242,235,221,0.5)]">
                      {heroReadoutUnits[r.label]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* FORM PANEL */}
        <main className="flex items-center justify-center px-5 py-14 sm:px-8 lg:px-12">
          <LoginForm />
        </main>
      </div>
    </div>
  );
}