import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { HeroLens } from "@/features/landing/HeroLens";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CtaBand } from "@/components/CtaBand";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { LandingMotion } from "@/components/motion/LandingMotion";
import { AuthLink } from "@/features/auth/AuthModalProvider";
import { heroReadoutUnits } from "@/config/sensors";
import {
  heroReadouts,
  waterQualityThresholds,
} from "@/content/landing-preview";

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

const buttonMotion =
  "transition-all duration-200 hover:-translate-y-px active:translate-y-0";

const eyebrow =
  "mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]";

const STEPS: { step: string; title: string; body: string; icon: IconName }[] = [
  {
    step: "01",
    title: "Sense",
    icon: "activity",
    body: "Five sensors stream water readings around the clock.",
  },
  {
    step: "02",
    title: "Analyze",
    icon: "eye",
    body: "Cameras estimate shrimp growth and biomass without handling.",
  },
  {
    step: "03",
    title: "Act",
    icon: "zap",
    body: "Aerators start automatically. Feed follows biomass.",
  },
  {
    step: "04",
    title: "Return",
    icon: "leaf",
    body: "Treated wastewater is routed to mangrove and wetland.",
  },
];

const STATS = [
  { label: "Parameters tracked", value: String(heroReadouts.length) },
  { label: "Aeration", value: "Automatic" },
  { label: "Growth vision", value: "No handling" },
];

// Gauge scale and target zone per reading, used only to draw the range bars.
// Same numbers as the dashboard thresholds.
const ZONES: Record<
  string,
  { min: number; max: number; lo: number; hi: number }
> = {
  "Dissolved O₂": { min: 0, max: 8, lo: 4.5, hi: 8 },
  pH: { min: 6, max: 10, lo: 7.5, hi: 8.5 },
  Temperature: { min: 20, max: 36, lo: 26, hi: 30 },
  Salinity: { min: 0, max: 30, lo: 10, hi: 20 },
  "Water Level": { min: 0, max: 100, lo: 90, hi: 100 },
};

const CROSSES = [
  { left: "6%", top: "18%" },
  { left: "44%", top: "9%" },
  { left: "93%", top: "26%" },
  { left: "12%", top: "82%" },
  { left: "52%", top: "90%" },
  { left: "88%", top: "78%" },
];

const pct = (v: number, min: number, max: number) =>
  Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));

function targetRangeFor(label: string): string | undefined {
  return waterQualityThresholds.find((t) => t.label === label)?.range;
}

// Splits a line into words, each in a clipping wrapper so GSAP can slide it up.
function Words({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={`${word}-${i}`}>
      <span className="inline-block overflow-hidden align-bottom pb-[0.16em] -mb-[0.16em]">
        <span data-hero="word" className="inline-block">
          {word}
        </span>
      </span>{" "}
    </Fragment>
  ));
}

export function LandingPage() {
  return (
    <div className="marketing-shell flex min-h-screen flex-col bg-white text-[var(--ep-primary)]">
      <LandingMotion />
      <SiteHeader tone="white" />

      <main className="flex-1">
        {/* HERO: cream (60%) with a faint blueprint grid and one coral accent */}
        <section id="top" className="ep-landing-hero relative isolate overflow-hidden bg-[#f5f9fc] text-[#171f2b] dark:bg-[#101b2a] dark:text-[#f4f7fb]">
          <div
            aria-hidden="true"
            data-hero="grid"
            className="pointer-events-none absolute inset-x-0 -top-[10%] -z-10 h-[120%] opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(var(--ep-primary) 1px, transparent 1px), linear-gradient(90deg, var(--ep-primary) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              WebkitMaskImage:
                "radial-gradient(ellipse at 60% 40%, black 25%, transparent 72%)",
              maskImage:
                "radial-gradient(ellipse at 60% 40%, black 25%, transparent 72%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(680px circle at 78% 38%, rgba(105,157,207,0.22), transparent 62%), radial-gradient(520px circle at 8% 95%, rgba(87,115,158,0.10), transparent 60%), linear-gradient(135deg, #f8fbff 0%, #edf4fb 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            {CROSSES.map((c) => (
              <span
                key={`${c.left}-${c.top}`}
                data-cross=""
                className="absolute h-4 w-4 opacity-[0.15]"
                style={{ left: c.left, top: c.top }}
              >
                <span className="absolute left-1/2 top-0 h-full w-px bg-[var(--ep-accent)]" />
                <span className="absolute left-0 top-1/2 h-px w-full bg-[var(--ep-accent)]" />
              </span>
            ))}
          </div>

          <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1.05fr] md:gap-14 lg:py-28">
            <div
              data-hero="parallax-console"
              className="ep-hero-visual order-2 relative mx-auto w-full max-w-[560px] md:order-2"
            >
              <div data-hero="console" className="ep-hero-console relative z-[1] rounded-[2rem] border border-white/80 bg-white/60 p-3 shadow-[0_28px_90px_-34px_rgba(38,75,112,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-4">
                <HeroLens />
              </div>
            </div>

            <div data-hero="text" className="ep-hero-copy order-1 text-center md:order-1 md:text-left">
              <div
                data-hero="eyebrow"
                className="mb-5 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ep-text-muted)] md:justify-start"
              >
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span
                    data-live-ping=""
                    className="absolute inline-flex h-full w-full rounded-full bg-[var(--ep-ok)] opacity-60"
                  />
                  <span className="relative h-2 w-2 rounded-full bg-[var(--ep-ok)]" />
                </span>
                Intelligent aquaculture · 24/7
              </div>

              <h1
                aria-label="Indoor shrimp farming, always in range."
                className="ep-font-display text-[clamp(46px,6.2vw,78px)] font-semibold leading-[0.99] tracking-[-0.045em]"
              >
                <span aria-hidden="true">
                  <span data-hero-headline-accent className="text-[#57739e] dark:text-[#a9c9ee]">
                    <Words text="Smarter shrimp farming," />
                  </span>
                  <span className="block text-[var(--ep-primary)]">
                    <Words text="naturally in balance." />
                  </span>
                </span>
              </h1>

              <p
                data-hero="lead"
                className="mt-7 max-w-[34rem] text-[17px] leading-[1.8] text-[#5e6d7e] dark:text-[#bdc9d7] sm:text-lg"
              >
                Bring water quality, automated feeding, and AI growth insights
                together in one calm, connected view of your farm.
              </p>

              <div
                data-hero="cta"
                className="mt-9 flex flex-col gap-3 sm:flex-row md:justify-start"
              >
                <AuthLink
                  className={`group inline-flex items-center justify-center gap-2 rounded-full border border-[#57739e] bg-[#57739e] px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_26px_-12px_rgba(54,91,137,0.65)] hover:border-[#405d83] hover:bg-[#405d83] ${buttonMotion} ${focusRing}`}
                >
                  Sign in to dashboard
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </AuthLink>

                <Link
                  to="/about"
                  className={`inline-flex items-center justify-center rounded-full border border-[#b9c9d9] bg-white/55 px-7 py-3.5 text-base font-semibold text-[#24364a] hover:border-[#57739e] hover:bg-white dark:border-white/20 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10 ${buttonMotion} ${focusRing}`}
                  activeOptions={{ exact: true }}
                >
                  See how it works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* READINGS: deep teal (30%). Each reading is a card shown against its target zone. */}
        <section
          id="readings"
          aria-labelledby="readings-title"
          className="ep-readings-section relative isolate overflow-hidden border-y border-[#1a2a40] bg-[#101b2a] text-white"
        >
          <div
            aria-hidden="true"
            data-readings-bg=""
            className="pointer-events-none absolute inset-0 -z-10 opacity-90"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 12% 8%, rgba(87,115,158,0.34), transparent 42%), radial-gradient(ellipse at 88% 76%, rgba(55,104,157,0.25), transparent 48%), radial-gradient(ellipse at 52% 118%, rgba(34,75,117,0.32), transparent 52%), linear-gradient(155deg, #172b43 0%, #101f33 52%, #0a1525 100%)",
            }}
          />

          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-24">
            <div data-reveal="" className="max-w-[40rem]">
              <div className={`${eyebrow} !text-[rgba(255,255,255,0.85)]`}>
                <span
                  aria-hidden="true"
                  className="h-2 w-2 bg-[var(--coral)]"
                />
                Target ranges
              </div>
              <h2
                id="readings-title"
                className="ep-font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.12] tracking-tight"
              >
                Five readings, each held in range.
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-[rgba(255,255,255,0.88)]">
                Sample values from Tank 1, shown against the range shrimp need.
              </p>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
              {heroReadouts.map((r) => {
                const zone = ZONES[r.label];
                const value = parseFloat(r.value);
                const zoneLeft = zone ? pct(zone.lo, zone.min, zone.max) : 0;
                const zoneWidth = zone
                  ? pct(zone.hi, zone.min, zone.max) - zoneLeft
                  : 0;
                const markerLeft = zone ? pct(value, zone.min, zone.max) : 0;
                const inRange = zone
                  ? value >= zone.lo && value <= zone.hi
                  : true;
                const range = targetRangeFor(r.label);
                return (
                  <div
                    key={r.label}
                    data-reading=""
                    data-hover-lift=""
                    className="rounded-xl border border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.05)] p-5 transition-[background-color,border-color] duration-200 hover:border-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.09)] last:col-span-2 md:last:col-span-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <dt className="text-base font-semibold text-[rgba(255,255,255,0.92)]">
                        {r.label}
                      </dt>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-[var(--ep-bg)] ${
                          inRange
                            ? "bg-[rgba(91,155,120,0.28)]"
                            : "bg-[rgba(232,162,58,0.32)]"
                        }`}
                      >
                        {inRange ? (
                          <Icon
                            name="check"
                            size={12}
                            strokeWidth={2.5}
                            className="text-[var(--mangrove-light)]"
                          />
                        ) : (
                          <span>!</span>
                        )}
                        {inRange ? "In range" : "Out of range"}
                      </span>
                    </div>

                    <dd className="mt-3 text-4xl font-semibold tabular-nums">
                      <span data-countto={r.value}>{r.value}</span>
                      <span className="ml-1 text-base font-medium text-[rgba(255,255,255,0.8)]">
                        {heroReadoutUnits[r.label]}
                      </span>
                    </dd>

                    <div
                      aria-hidden="true"
                      className="relative mx-2 mt-6 h-2 rounded-full bg-[rgba(255,255,255,0.16)]"
                    >
                      <div
                        data-zone=""
                        className="absolute inset-y-0 rounded-full bg-[var(--mangrove-light)]"
                        style={{ left: `${zoneLeft}%`, width: `${zoneWidth}%` }}
                      />
                      <div
                        data-marker=""
                        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${markerLeft}%` }}
                      >
                        <span
                          data-ping=""
                          className="absolute inset-0 rounded-full border-2 border-[var(--coral)] opacity-0"
                        />
                        <span className="absolute inset-0 rounded-full border-2 border-[var(--ep-primary)] bg-[var(--coral)]" />
                      </div>
                    </div>

                    {zone && (
                      <div
                        aria-hidden="true"
                        className="mt-2.5 flex justify-between text-xs tabular-nums text-[rgba(255,255,255,0.7)]"
                      >
                        <span>{zone.min}</span>
                        <span>{zone.max}</span>
                      </div>
                    )}

                    {range && (
                      <p className="mt-2 text-sm text-[rgba(255,255,255,0.85)]">
                        Target {range}
                      </p>
                    )}
                  </div>
                );
              })}
            </dl>

            {/* Legend: explains what the bar and dot mean */}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-[rgba(255,255,255,0.85)]">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-8 rounded-full bg-[var(--mangrove-light)]"
                />
                Target zone
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 rounded-full border-2 border-[var(--ep-primary)] bg-[var(--coral)]"
                />
                Current reading
              </span>
            </div>
          </div>
        </section>

        {/* PROCESS: four stages on a single rule that fills as you scroll */}
        <section
          id="process"
          aria-labelledby="process-title"
          className="ep-process-section bg-[#f5f9fc] px-5 py-20 dark:bg-[#111d2c] sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px]">
            <div data-reveal="" className="mb-14 max-w-[40rem]">
              <div className={eyebrow}>
                <span
                  aria-hidden="true"
                  className="h-2 w-2 bg-[var(--ep-accent)]"
                />
                The loop
              </div>
              <h2
                id="process-title"
                className="ep-font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.12] tracking-tight"
              >
                From sensor to mangrove.
              </h2>
            </div>

            <div className="relative lg:border-t lg:border-[var(--ep-line)]">
              <span
                aria-hidden="true"
                data-process-line=""
                className="pointer-events-none absolute -top-px left-0 hidden h-0.5 w-full origin-left bg-[var(--ep-accent)] lg:block"
              />
              <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {STEPS.map((s) => (
                  <li
                    key={s.step}
                    data-step=""
                    data-hover-lift=""
                    className="group relative border-t border-[var(--ep-line)] pt-8 transition-colors duration-200 hover:border-[var(--ep-accent)] lg:border-t-0"
                  >
                    <span
                      aria-hidden="true"
                      data-step-node=""
                      className="absolute -top-[5px] left-0 hidden h-2.5 w-2.5 bg-[var(--ep-primary)] lg:block"
                    />
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-sm font-semibold tabular-nums tracking-wide text-[var(--ep-text-muted)] transition-colors duration-200 group-hover:text-[var(--ep-accent)]">
                        {s.step}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--ep-primary)] text-[var(--ep-primary)] transition-colors duration-200 group-hover:bg-[var(--ep-primary)] group-hover:text-[var(--ep-bg)]">
                        <Icon name={s.icon} size={22} />
                      </span>
                    </div>
                    <h3 className="ep-font-display mb-2 text-2xl font-semibold transition-colors duration-200 group-hover:text-[var(--ep-accent)]">
                      {s.title}
                    </h3>
                    <p className="text-base leading-relaxed text-[var(--ep-text-muted)]">
                      {s.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <Reveal>
          <CtaBand secondaryHref="/about" secondaryLabel="See how it works" />
        </Reveal>
      </main>

      <SiteFooter />
    </div>
  );
}
