import { useState } from "react";
import { TankHeroSvg } from "./TankHeroSvg";
import { BrandMark } from "../components/BrandMark";
import { useView } from "../context/ViewContext";
import { LANDING_NAV_LINKS } from "../constants/nav";
import {
  heroReadouts,
  heroReadoutUnits,
  objectives,
  features,
  inScope,
  outOfScope,
} from "../data/ecoprawn";

export function LandingPage() {
  const { setView } = useView();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleNavClick() {
    setMobileNavOpen(false);
  }

  function openDashboard() {
    setView("login");
  }

  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--water-deep)] scroll-smooth">
      {/* =========================================================
          TOP NAVIGATION
      ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-[rgba(11,35,32,0.08)] bg-[var(--sand)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[52px] max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <a
            href="#top"
            className="group flex items-center gap-2.5 text-[var(--coral)] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)]"
            aria-label="EcoPrawn home"
          >
            <BrandMark size={26} />
          </a>

          <nav className="hidden h-full items-center gap-7 md:flex" aria-label="Primary navigation">
            {LANDING_NAV_LINKS.map(([label, href], index) => (
              <a
                key={label}
                href={href}
                className={`relative flex h-full items-center px-1 text-[12px] font-semibold text-[var(--water-deep)] transition-colors hover:text-[var(--coral)] rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)] ${
                  index === 0
                    ? "after:absolute after:bottom-[8px] after:left-0 after:right-0 after:h-[2px] after:bg-[var(--coral)]"
                    : ""
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openDashboard}
              className="rounded-xl bg-[var(--water-deep)] px-4 py-2 text-[11px] font-semibold text-[var(--sand)] shadow-[0_8px_20px_-10px_rgba(11,35,32,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#123F43] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)] sm:px-5 sm:text-[12px]"
            >
              Log in
            </button>

            {/* Mobile nav toggle */}
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(11,35,32,0.12)] text-[var(--water-deep)] transition-colors hover:bg-[rgba(11,35,32,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)] md:hidden"
            >
              <span className="sr-only">Toggle navigation</span>
              {mobileNavOpen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M1.5 4H14.5M1.5 8H14.5M1.5 12H14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav panel */}
        {mobileNavOpen && (
          <nav
            id="mobile-nav-panel"
            aria-label="Mobile navigation"
            className="border-t border-[rgba(11,35,32,0.08)] bg-[var(--sand)] px-5 py-3 md:hidden"
          >
            <ul className="flex flex-col">
              {LANDING_NAV_LINKS.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    onClick={handleNavClick}
                    className="block rounded-md px-1.5 py-2.5 text-[13px] font-semibold text-[var(--water-deep)] transition-colors hover:text-[var(--coral)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        id="top"
        className="relative overflow-hidden text-[var(--sand)]"
        style={{
          background:
            "linear-gradient(180deg, #07565A 0%, var(--water-deep) 58%, #081E22 100%)",
        }}
      >
        {/* Atmospheric background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[12%] top-[4%] h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(232,98,58,0.22), transparent 68%)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[15%] bottom-[4%] h-[460px] w-[460px] rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(126,173,135,0.2), transparent 68%)",
          }}
        />

        {/* Decorative grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,235,221,1) 1px, transparent 1px), linear-gradient(90deg, rgba(242,235,221,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1240px] px-5 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pt-12">
          {/* Main hero row */}
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.03fr_0.97fr] md:gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
            {/* Hero copy */}
            <div className="max-w-[650px] py-2 md:py-6 lg:py-8">
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[rgba(242,235,221,0.15)] bg-[rgba(242,235,221,0.045)] px-3.5 py-2 backdrop-blur-sm">
                <span className="ep-pulse-dot h-[7px] w-[7px] rounded-full bg-[var(--mangrove-light)] shadow-[0_0_10px_rgba(126,173,135,0.7)]" />
                <span className="ep-font-mono text-[10px] font-medium tracking-[0.13em] text-[rgba(242,235,221,0.78)] sm:text-[11px]">
                  AIoT GROW-OUT SYSTEM
                </span>
                <span className="hidden h-3 w-px bg-[rgba(242,235,221,0.2)] sm:block" />
                <span className="hidden text-[10px] text-[rgba(242,235,221,0.55)] sm:block">
                  Penaeus vannamei
                </span>
              </div>

              <h1 className="ep-font-display max-w-[720px] text-[clamp(38px,5vw,64px)] font-semibold leading-[0.98] tracking-[-0.04em]">
                Indoor shrimp
                <br />
                farming,
                <br />
                <em className="font-medium italic text-[var(--coral)]">
                  read like a dashboard.
                </em>
              </h1>

              <p className="mt-5 max-w-[540px] text-[14px] leading-[1.62] text-[rgba(242,235,221,0.78)] sm:text-[15px]">
                EcoPrawn pairs a submerged sensor array, AI vision growth
                tracking, and a biofloc recirculation loop to keep white
                shrimp tanks in range 24/7 — and routes what the tank doesn't
                need back into the mangroves.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={openDashboard}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[var(--coral)] px-6 py-3.5 text-[14px] font-semibold text-[var(--sand)] shadow-[0_14px_32px_-10px_rgba(232,98,58,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--coral-dim)] hover:shadow-[0_18px_38px_-10px_rgba(232,98,58,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--water-deep)]"
                >
                  Sign in to dashboard
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </button>

                <a
                  href="#objectives"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(242,235,221,0.2)] bg-[rgba(242,235,221,0.035)] px-6 py-3.5 text-[14px] font-semibold text-[var(--sand)] backdrop-blur-sm transition-all duration-200 hover:border-[rgba(242,235,221,0.4)] hover:bg-[rgba(242,235,221,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
                >
                  See how it works
                  <span aria-hidden="true">↓</span>
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
                {["SYSTEM ONLINE", "WATER MONITORING", "AI VISION"].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--mangrove-light)] shadow-[0_0_8px_rgba(126,173,135,0.7)]" />
                    <span className="ep-font-mono text-[9.5px] tracking-[0.1em] text-[rgba(242,235,221,0.6)]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tank visualization */}
            <div className="relative mx-auto flex h-[320px] w-full max-w-[420px] items-center justify-center sm:h-[380px] sm:max-w-[480px] md:h-[420px] md:max-w-none lg:h-[440px]">
              <div className="relative z-10 flex h-full w-full max-w-[560px] items-center justify-center [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full">
                <TankHeroSvg />
              </div>

              {/* Live monitor card */}
              <div className="absolute right-0 top-1 z-20 hidden w-[160px] rounded-xl border border-[rgba(242,235,221,0.13)] bg-[rgba(8,30,34,0.78)] p-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] backdrop-blur-md md:block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="ep-font-mono text-[8px] uppercase tracking-[0.12em] text-[rgba(242,235,221,0.55)]">
                    Live monitor
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--mangrove-light)] shadow-[0_0_7px_rgba(126,173,135,0.7)]" />
                </div>
                <div className="ep-font-mono text-[20px] font-semibold text-[var(--sand)]">
                  24/7
                </div>
                <div className="mt-1 text-[9px] leading-[1.4] text-[rgba(242,235,221,0.55)]">
                  Continuous tank monitoring
                </div>
              </div>

              {/* Intelligent control card */}
              <div className="absolute bottom-1 left-0 z-20 hidden w-[170px] rounded-xl border border-[rgba(242,235,221,0.13)] bg-[rgba(8,30,34,0.78)] p-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] backdrop-blur-md md:block">
                <div className="mb-2 text-[9px] uppercase tracking-[0.1em] text-[rgba(242,235,221,0.55)]">
                  Intelligent control
                </div>
                <div className="flex items-center gap-2">
                  <span className="ep-font-mono text-[12px] text-[var(--mangrove-light)]">
                    AI
                  </span>
                  <span className="h-px flex-1 bg-[rgba(242,235,221,0.1)]" />
                  <span className="ep-font-mono text-[9px] text-[rgba(242,235,221,0.55)]">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry strip */}
          <div className="mt-8 border-t border-[rgba(242,235,221,0.18)] md:mt-4">
            <div className="grid grid-cols-2 md:grid-cols-5">
              {heroReadouts.map((readout, index) => (
                <div
                  key={readout.label}
                  className={`group px-2 py-4 sm:px-3 sm:py-5 ${
                    index !== heroReadouts.length - 1
                      ? "md:border-r md:border-[rgba(242,235,221,0.1)]"
                      : ""
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--mangrove-light)] opacity-80 transition-opacity group-hover:opacity-100" />
                    <div className="ep-font-mono text-[8.5px] uppercase tracking-[0.1em] text-[rgba(242,235,221,0.55)] sm:text-[9px]">
                      {readout.label}
                    </div>
                  </div>
                  <div className="ep-font-mono text-[19px] font-semibold tracking-tight text-[var(--sand)] sm:text-[22px]">
                    {readout.value}
                    <span className="ml-1 text-[10px] font-normal text-[rgba(242,235,221,0.5)] sm:text-[11px]">
                      {heroReadoutUnits[readout.label]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          OBJECTIVES
      ========================================================= */}
      <section
        id="objectives"
        className="scroll-mt-[68px] px-5 py-24 sm:px-8 sm:py-28 lg:py-[120px]"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 max-w-[680px] sm:mb-14">
            <div className="ep-font-mono mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)]">
              Why it exists
            </div>

            <h2 className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.08] tracking-tight text-[var(--water-deep)]">
              One general objective.
              <br className="hidden sm:block" />
              Five ways to hit it.
            </h2>

            <p className="mt-4 max-w-[590px] text-[15px] leading-[1.7] text-[rgba(11,35,32,0.62)]">
              A focused system architecture designed around measurable
              aquaculture outcomes.
            </p>
          </div>

          {/* General objective */}
          <div className="relative mb-5 overflow-hidden rounded-2xl bg-[var(--water-deep)] px-6 py-8 text-[var(--sand)] shadow-[0_20px_50px_-25px_rgba(11,35,32,0.4)] sm:px-10 sm:py-10">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-[280px] w-[280px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(232,98,58,0.22), transparent 70%)",
              }}
            />

            <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[720px]">
                <div className="ep-font-mono mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--coral)]">
                  General Objective
                </div>

                <p className="ep-font-display text-[19px] font-medium italic leading-[1.6] sm:text-[21px]">
                  "To design and deploy an automated indoor aquaculture system
                  leveraging Artificial Intelligence and Internet of Things
                  technologies to optimize shrimp growth rates, maintain
                  pristine water quality, and establish a resource-efficient
                  operational model."
                </p>
              </div>

              <div className="hidden shrink-0 lg:block">
                <div className="ep-font-mono rounded-full border border-[rgba(242,235,221,0.12)] px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[rgba(242,235,221,0.55)]">
                  Core objective
                </div>
              </div>
            </div>
          </div>

          {/* Objective cards */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            {objectives.map((objective) => (
              <article
                key={objective.num}
                className="group rounded-xl border border-[var(--sand-dim)] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--mangrove-light)] hover:shadow-[0_18px_36px_-16px_rgba(11,35,32,0.2)]"
              >
                <div className="mb-7 flex items-center justify-between">
                  <span className="ep-font-mono text-[11px] font-semibold text-[var(--coral)]">
                    {objective.num}
                  </span>

                  <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--sand-dim)] text-[11px] text-[rgba(11,35,32,0.4)] transition-all group-hover:border-[var(--mangrove-light)] group-hover:text-[var(--mangrove)]">
                    ↗
                  </span>
                </div>

                <h3 className="ep-font-display mb-2 text-[16px] font-semibold leading-tight text-[var(--water-deep)]">
                  {objective.title}
                </h3>

                <p className="text-[12.5px] leading-[1.6] text-[rgba(11,35,32,0.62)]">
                  {objective.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES / SYSTEMS
      ========================================================= */}
      <section
        id="systems"
        className="scroll-mt-[68px] bg-[var(--water-deep)] px-5 py-24 text-[var(--sand)] sm:px-8 sm:py-28 lg:py-[120px]"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 max-w-[700px] sm:mb-14">
            <div className="ep-font-mono mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--coral)]">
              What's inside
            </div>

            <h2 className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.08] tracking-tight">
              Five systems,
              <br className="hidden sm:block" />
              one tank.
            </h2>

            <p className="mt-4 max-w-[590px] text-[15px] leading-[1.7] text-[rgba(242,235,221,0.68)]">
              Every feature maps to a spec in the proposal — nothing here is
              decorative.
            </p>
          </div>

          <div className="border-t border-[rgba(242,235,221,0.12)]">
            {features.map((feature) => (
              <article
                key={feature.index}
                className="group grid grid-cols-[38px_1fr] gap-5 border-b border-[rgba(242,235,221,0.12)] py-7 transition-colors duration-200 hover:bg-[rgba(242,235,221,0.025)] sm:grid-cols-[55px_0.8fr_1.2fr] sm:gap-7 sm:py-8 lg:grid-cols-[65px_0.8fr_1.2fr] lg:gap-8"
              >
                <div className="ep-font-mono pt-1 text-[11px] font-medium text-[var(--mangrove-light)]">
                  {feature.index}
                </div>

                <div>
                  <div className="mb-2 hidden text-[9px] uppercase tracking-[0.12em] text-[rgba(242,235,221,0.4)] sm:block">
                    System module
                  </div>

                  <h3 className="ep-font-display text-[20px] font-semibold leading-tight transition-colors group-hover:text-[var(--coral)] sm:text-[21px]">
                    {feature.title}
                  </h3>
                </div>

                <div className="col-span-2 flex flex-col gap-3 pl-[58px] sm:col-span-1 sm:pl-0">
                  {feature.points.map((point) => (
                    <div key={point.bold} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[2px] text-[var(--coral)]">
                        ›
                      </span>

                      <span className="text-[13px] leading-[1.65] text-[rgba(242,235,221,0.72)] sm:text-[13.5px]">
                        <b className="font-semibold text-[var(--sand)]">{point.bold}</b>{" "}
                        {point.body}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SCOPE / LIMITATIONS
      ========================================================= */}
      <section
        id="scope"
        className="scroll-mt-[68px] px-5 py-24 sm:px-8 sm:py-28 lg:py-[120px]"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 max-w-[700px] sm:mb-14">
            <div className="ep-font-mono mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)]">
              Boundaries
            </div>

            <h2 className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.08] tracking-tight text-[var(--water-deep)]">
              Scope and limitations.
            </h2>

            <p className="mt-4 max-w-[590px] text-[15px] leading-[1.7] text-[rgba(11,35,32,0.62)]">
              Stated plainly, so expectations line up with what's actually
              being built.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* In scope */}
            <article className="rounded-2xl border border-[var(--sand-dim)] bg-white p-6 shadow-[0_12px_32px_-24px_rgba(11,35,32,0.3)] sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <h3 className="ep-font-display flex items-center gap-2.5 text-[20px] font-semibold text-[var(--water-deep)]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(126,173,135,0.12)]">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--mangrove)]" />
                  </span>
                  In scope
                </h3>

                <span className="ep-font-mono rounded-full bg-[rgba(126,173,135,0.1)] px-2.5 py-1 text-[8px] uppercase tracking-[0.1em] text-[var(--mangrove)]">
                  Included
                </span>
              </div>

              <div>
                {inScope.map((item, index) => (
                  <div
                    key={item.title}
                    className={`py-4 ${index !== 0 ? "border-t border-[rgba(11,35,32,0.08)]" : "pt-0"}`}
                  >
                    <div className="flex gap-3">
                      <span className="ep-font-mono mt-0.5 text-[9px] text-[var(--mangrove)]">
                        0{index + 1}
                      </span>

                      <div>
                        <b className="mb-1 block text-[13.5px] font-semibold text-[var(--water-deep)]">
                          {item.title}
                        </b>

                        <span className="text-[13px] leading-[1.6] text-[rgba(11,35,32,0.62)]">
                          {item.body}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Out of scope */}
            <article className="rounded-2xl border border-[#EAD9B8] bg-[#FBF6EC] p-6 shadow-[0_12px_32px_-24px_rgba(11,35,32,0.25)] sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <h3 className="ep-font-display flex items-center gap-2.5 text-[20px] font-semibold text-[var(--water-deep)]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(181,139,57,0.1)]">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--amber)]" />
                  </span>
                  Out of scope
                </h3>

                <span className="ep-font-mono rounded-full bg-[rgba(181,139,57,0.1)] px-2.5 py-1 text-[8px] uppercase tracking-[0.1em] text-[var(--amber)]">
                  Excluded
                </span>
              </div>

              <div>
                {outOfScope.map((item, index) => (
                  <div
                    key={item.title}
                    className={`py-4 ${index !== 0 ? "border-t border-[rgba(11,35,32,0.08)]" : "pt-0"}`}
                  >
                    <div className="flex gap-3">
                      <span className="ep-font-mono mt-0.5 text-[9px] text-[var(--amber)]">
                        0{index + 1}
                      </span>

                      <div>
                        <b className="mb-1 block text-[13.5px] font-semibold text-[var(--water-deep)]">
                          {item.title}
                        </b>

                        <span className="text-[13px] leading-[1.6] text-[rgba(11,35,32,0.62)]">
                          {item.body}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="px-5 pb-24 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="relative overflow-hidden rounded-2xl bg-[var(--water-deep)] px-6 py-10 text-center text-[var(--sand)] shadow-[0_24px_60px_-30px_rgba(11,35,32,0.5)] sm:px-10 sm:py-14">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(232,98,58,0.14), transparent 68%)",
              }}
            />

            <div className="relative z-10">
              <div className="ep-font-mono mb-3 text-[9px] uppercase tracking-[0.14em] text-[var(--mangrove-light)]">
                EcoPrawn AIoT System
              </div>

              <h2 className="ep-font-display text-[clamp(26px,4vw,38px)] font-semibold leading-tight">
                Ready to read the tank?
              </h2>

              <p className="mx-auto mt-3 max-w-[500px] text-[13.5px] leading-[1.65] text-[rgba(242,235,221,0.68)]">
                Monitor the system, review its signals, and manage the
                aquaculture environment from one dashboard.
              </p>

              <button
                onClick={openDashboard}
                className="mt-7 inline-flex items-center gap-2.5 rounded-xl bg-[var(--coral)] px-6 py-3.5 text-[13.5px] font-semibold text-[var(--sand)] shadow-[0_12px_28px_-8px_rgba(232,98,58,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--coral-dim)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--water-deep)]"
              >
                Sign in to dashboard
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-[#081E22] px-5 py-10 text-[rgba(242,235,221,0.55)] sm:px-8 sm:py-12">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2">
              <span className="ep-font-display text-[17px] font-semibold text-[var(--sand)]">
                EcoPrawn
              </span>
            </div>

            <div className="max-w-[420px] text-[12px] leading-[1.6]">
              AIoT-Enabled Indoor White Shrimp Farming &amp; Water Management
              System
            </div>
          </div>

          <div className="text-left text-[11.5px] leading-[1.7] sm:text-right">
            University of Caloocan City, Congress Campus — Computer Studies
            Department
            <br />
            Project Proposal, CS 118 · Thesis Writing 1
          </div>
        </div>
      </footer>
    </div>
  );
}
