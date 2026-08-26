import { TankHeroSvg } from "./TankHeroSvg";
import {
  heroReadouts,
  heroReadoutUnits,
  objectives,
  features,
  inScope,
  outOfScope,
} from "./data";

interface LandingViewProps {
  onOpenDashboard: () => void;
}

export function LandingView({ onOpenDashboard }: LandingViewProps) {
  return (
    <div>
      {/* HERO */}
      <section
        className="relative min-h-[92vh] text-[var(--sand)] overflow-hidden flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, var(--water-mid) 0%, var(--water-deep) 62%, #081E22 100%)",
        }}
      >
        <div className="relative z-[3] max-w-[1200px] mx-auto w-full px-8 pt-[88px] grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-10 items-center flex-1">
          <div>
            <div className="ep-font-mono text-xs tracking-[0.14em] uppercase text-[var(--mangrove-light)] flex items-center gap-2.5 mb-[22px]">
              <span className="ep-pulse-dot w-[7px] h-[7px] rounded-full bg-[var(--mangrove-light)]" />
              AIoT Grow-Out System &middot; Penaeus vannamei
            </div>
            <h1 className="ep-font-display font-semibold text-[clamp(38px,5vw,62px)] leading-[1.03] tracking-tight mb-[22px]">
              Indoor shrimp farming,
              <br />
              <em className="italic font-medium text-[var(--coral)]">
                read like a dashboard.
              </em>
            </h1>
            <p className="text-[17px] leading-[1.65] text-[rgba(242,235,221,0.78)] max-w-[480px] mb-[34px]">
              EcoPrawn pairs a submerged sensor array, AI vision growth tracking, and a
              biofloc recirculation loop to keep white shrimp tanks in range 24/7 — and
              routes what the tank doesn't need back into the mangroves.
            </p>
            <div className="flex gap-3.5 flex-wrap">
              <button
                onClick={onOpenDashboard}
                className="inline-flex items-center gap-2 px-[26px] py-3.5 rounded-lg text-[14.5px] font-semibold bg-[var(--coral)] text-[var(--sand)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--coral-dim)] hover:shadow-[0_12px_28px_-8px_rgba(232,98,58,0.55)]"
              >
                Open the dashboard →
              <a
                href="#objectives"
                className="inline-flex items-center gap-2 px-[26px] py-3.5 rounded-lg text-[14.5px] font-semibold bg-transparent text-[var(--sand)] border border-[rgba(242,235,221,0.28)] transition-all duration-200 hover:bg-[rgba(242,235,221,0.08)] hover:border-[rgba(242,235,221,0.5)]"
              >
                See how it works
              </a>
              </button>
            </div>
          </div>
          <div className="relative h-[280px] md:h-[440px] flex items-center justify-center order-first md:order-last">
            <TankHeroSvg />
          </div>
        </div>

        <div className="relative z-[3] max-w-[1200px] mx-auto w-full px-8 mt-14">
          <div className="grid grid-cols-2 md:grid-cols-5 border-t border-[rgba(242,235,221,0.16)]">
            {heroReadouts.map((r, i) => (
              <div
                key={r.label}
                className={`px-1 pt-5 pb-[26px] ${
                  i !== heroReadouts.length - 1 ? "md:border-r border-[rgba(242,235,221,0.12)]" : ""
                }`}
              >
                <div className="ep-font-mono text-[10.5px] tracking-wide uppercase text-[rgba(242,235,221,0.5)] mb-2">
                  {r.label}
                </div>
                <div className="ep-font-mono text-[22px] font-semibold text-[var(--sand)] before:content-['●'] before:text-[var(--mangrove-light)] before:text-[9px] before:mr-[7px] before:align-middle">
                  {r.value}
                  <span className="text-[13px] text-[rgba(242,235,221,0.55)] ml-0.5">
                    {heroReadoutUnits[r.label]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OBJECTIVES */}
      <section className="px-8 py-[110px] max-w-[1200px] mx-auto" id="objectives">
        <div className="max-w-[640px] mb-14">
          <div className="ep-font-mono text-xs tracking-wide uppercase text-[var(--mangrove)] mb-3.5 font-semibold">
            Why it exists
          </div>
          <h2 className="ep-font-display font-semibold text-[clamp(28px,3.4vw,40px)] tracking-tight leading-[1.12] text-[var(--water-deep)]">
            One general objective. Five ways to hit it.
          </h2>
        </div>

        <div className="relative overflow-hidden bg-[var(--water-deep)] text-[var(--sand)] rounded-2xl px-10 py-11 mb-5">
          <div
            className="absolute -right-[60px] -top-[60px] w-[220px] h-[220px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(232,98,58,0.22), transparent 70%)",
            }}
          />
          <span className="ep-font-mono text-[11px] tracking-wide uppercase text-[var(--coral)] mb-3.5 block">
            General Objective
          </span>
          <p className="ep-font-display text-[22px] leading-[1.5] font-medium italic max-w-[820px] relative z-[1]">
            "To design and deploy an automated indoor aquaculture system leveraging
            Artificial Intelligence and Internet of Things technologies to optimize
            shrimp growth rates, maintain pristine water quality, and establish a
            resource-efficient operational model."
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {objectives.map((o) => (
            <div
              key={o.num}
              className="bg-white border border-[var(--sand-dim)] rounded-xl p-[22px_18px] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_rgba(11,35,32,0.18)] hover:border-[var(--mangrove-light)]"
            >
              <div className="ep-font-mono text-xs text-[var(--coral)] font-semibold mb-3.5">
                {o.num}
              </div>
              <h3 className="ep-font-display text-base font-semibold text-[var(--water-deep)] mb-2 leading-tight">
                {o.title}
              </h3>
              <p className="text-[13px] leading-[1.55] text-[rgba(11,35,32,0.62)]">
                {o.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-8 py-[110px] bg-[var(--water-deep)] text-[var(--sand)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[640px] mb-14">
            <div className="ep-font-mono text-xs tracking-wide uppercase text-[var(--coral)] mb-3.5 font-semibold">
              What's inside
            </div>
            <h2 className="ep-font-display font-semibold text-[clamp(28px,3.4vw,40px)] tracking-tight leading-[1.12] text-[var(--sand)]">
              Five systems, one tank.
            </h2>
            <p className="text-base leading-[1.7] text-[rgba(242,235,221,0.68)] mt-4">
              Every feature maps to a spec in the proposal — nothing here is decorative.
            </p>
          </div>

          <div className="flex flex-col">
            {features.map((f) => (
              <div
                key={f.index}
                className="grid grid-cols-[40px_1fr] md:grid-cols-[60px_1fr_1.3fr] gap-8 items-start py-8 border-t border-[rgba(242,235,221,0.14)] last:border-b"
              >
                <div className="ep-font-mono text-[13px] text-[var(--mangrove-light)] pt-1">
                  {f.index}
                </div>
                <h3 className="ep-font-display text-[21px] font-semibold leading-tight col-start-2 md:col-start-auto">
                  {f.title}
                </h3>
                <div className="flex flex-col gap-3.5 col-span-2 md:col-span-1 mt-1.5 md:mt-0">
                  {f.points.map((p) => (
                    <div key={p.bold} className="flex gap-3">
                      <span className="text-[var(--coral)] text-[15px] leading-[1.5] flex-shrink-0">
                        ›
                      </span>
                      <span className="text-sm leading-[1.6] text-[rgba(242,235,221,0.72)]">
                        <b className="font-semibold text-[var(--sand)]">{p.bold}</b>{" "}
                        {p.body}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCOPE / LIMITATIONS */}
      <section className="px-8 py-[110px] max-w-[1200px] mx-auto">
        <div className="max-w-[640px] mb-14">
          <div className="ep-font-mono text-xs tracking-wide uppercase text-[var(--mangrove)] mb-3.5 font-semibold">
            Boundaries
          </div>
          <h2 className="ep-font-display font-semibold text-[clamp(28px,3.4vw,40px)] tracking-tight leading-[1.12] text-[var(--water-deep)]">
            Scope and limitations.
          </h2>
          <p className="text-base leading-[1.7] text-[rgba(11,35,32,0.68)] mt-4">
            Stated plainly, so expectations line up with what's actually being built.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-9 border border-[var(--sand-dim)]">
            <h3 className="ep-font-display text-xl font-semibold mb-5 text-[var(--water-deep)] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[var(--mangrove)]" />
              In scope
            </h3>
            {inScope.map((item, i) => (
              <div
                key={item.title}
                className={`py-3.5 ${i !== 0 ? "border-t border-[rgba(11,35,32,0.08)]" : "pt-0"}`}
              >
                <b className="block text-sm text-[var(--water-deep)] mb-1">{item.title}</b>
                <span className="text-[13.5px] leading-[1.55] text-[rgba(11,35,32,0.62)]">
                  {item.body}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-9 bg-[#FBF6EC] border border-[#EAD9B8]">
            <h3 className="ep-font-display text-xl font-semibold mb-5 text-[var(--water-deep)] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[var(--amber)]" />
              Out of scope
            </h3>
            {outOfScope.map((item, i) => (
              <div
                key={item.title}
                className={`py-3.5 ${i !== 0 ? "border-t border-[rgba(11,35,32,0.08)]" : "pt-0"}`}
              >
                <b className="block text-sm text-[var(--water-deep)] mb-1">{item.title}</b>
                <span className="text-[13.5px] leading-[1.55] text-[rgba(11,35,32,0.62)]">
                  {item.body}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#081E22] text-[rgba(242,235,221,0.55)] px-8 py-12 text-[13px] flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="ep-font-display font-semibold text-[var(--sand)]">EcoPrawn</span>
          {" "}— AIoT-Enabled Indoor White Shrimp Farming &amp; Water Management System
        </div>
        <div className="text-right leading-[1.6]">
          University of Caloocan City, Congress Campus — Computer Studies Department
          <br />
          Project Proposal, CS 118 · Thesis Writing 1
        </div>
      </footer>
    </div>
  );
}