"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TankHeroSvg } from "@/features/dashboard/TankHeroSvg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { heroReadouts, heroReadoutUnits } from "@/data/ecoprawn";

const SECTION_PAD = "px-5 py-20 sm:px-8 sm:py-24 lg:py-28";

export function LandingPage() {
  // Gentle scroll-tied depth cue for the hero tank visual. Capped so the
  // effect settles once the hero scrolls out of view, rather than running
  // as a persistent parallax gimmick down the whole page.
  const [heroOffset, setHeroOffset] = useState(0);

  useEffect(() => {
    function onScroll() {
      setHeroOffset(Math.min(window.scrollY * 0.08, 40));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // One orchestrated reveal for the page: the final CTA fades/slides into
  // place the first time it enters view.
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCtaVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--water-deep)] scroll-smooth">
      <SiteHeader />
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

        <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          {/* Main hero row */}
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.03fr_0.97fr] md:gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
            {/* Hero copy */}
            <div className="max-w-[650px]">
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[rgba(242,235,221,0.15)] bg-[rgba(242,235,221,0.045)] px-3.5 py-2 backdrop-blur-sm">
                <span className="ep-pulse-dot h-[7px] w-[7px] rounded-full bg-[var(--mangrove-light)] shadow-[0_0_10px_rgba(126,173,135,0.7)]" />
                <span className="ep-font-mono text-[10px] font-medium tracking-[0.13em] text-[rgba(242,235,221,0.78)] sm:text-[11px]">
                  AIoT GROW-OUT SYSTEM · LIVE
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
                EcoPrawn combines a submerged sensor array, AI-driven growth
                tracking, and a biofloc recirculation loop to keep white
                shrimp tanks within range around the clock — and routes
                whatever the tank doesn&apos;t need back into the mangroves.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[var(--coral)] px-6 py-3.5 text-[14px] font-semibold text-[var(--sand)] shadow-[0_14px_32px_-10px_rgba(232,98,58,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--coral-dim)] hover:shadow-[0_18px_38px_-10px_rgba(232,98,58,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--water-deep)]"
                >
                  Sign in to dashboard
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(242,235,221,0.2)] bg-[rgba(242,235,221,0.035)] px-6 py-3.5 text-[14px] font-semibold text-[var(--sand)] backdrop-blur-sm transition-all duration-200 hover:border-[rgba(242,235,221,0.4)] hover:bg-[rgba(242,235,221,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
                >
                  See how it works
                  <span aria-hidden="true">→</span>
                </Link>
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
              <div
                className="relative z-10 flex h-full w-full max-w-[560px] items-center justify-center [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full"
                style={{ transform: `translateY(${heroOffset}px)` }}
              >
                <TankHeroSvg />
              </div>

              {/* Live monitor card — desktop overlay */}
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

              {/* Intelligent control card — desktop overlay */}
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

            {/* Live monitor / Intelligent control — mobile row, shown
                below the tank instead of overlaid on top of it, since
                the absolute-positioned desktop cards have no room to
                breathe on a narrow viewport. */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              <div className="rounded-xl border border-[rgba(242,235,221,0.13)] bg-[rgba(8,30,34,0.78)] p-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] backdrop-blur-md">
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

              <div className="rounded-xl border border-[rgba(242,235,221,0.13)] bg-[rgba(8,30,34,0.78)] p-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] backdrop-blur-md">
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
          <div className="mt-14 border-t border-[rgba(242,235,221,0.18)] sm:mt-16">
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
          FINAL CTA
      ========================================================= */}
      <section className={SECTION_PAD}>
        <div className="mx-auto max-w-[1200px]">
          <div
            ref={ctaRef}
            className={`relative overflow-hidden rounded-2xl bg-[var(--water-deep)] px-6 py-10 text-center text-[var(--sand)] shadow-[0_24px_60px_-30px_rgba(11,35,32,0.5)] transition-all duration-700 ease-out sm:px-10 sm:py-14 ${
              ctaVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
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
                The tank is already talking.
              </h2>

              <p className="mx-auto mt-3 max-w-[500px] text-[13.5px] leading-[1.65] text-[rgba(242,235,221,0.68)]">
                Monitor the system, review its live signals, and manage the
                aquaculture environment from a single dashboard.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-2.5 rounded-xl bg-[var(--coral)] px-6 py-3.5 text-[13.5px] font-semibold text-[var(--sand)] shadow-[0_12px_28px_-8px_rgba(232,98,58,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--coral-dim)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--water-deep)]"
              >
                Sign in to dashboard
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}