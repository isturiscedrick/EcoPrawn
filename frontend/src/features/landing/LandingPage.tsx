import { Fragment } from "react";
import { PublicChromeMotion } from "@/components/motion/PublicChromeMotion";
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
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

const buttonMotion =
  "transition-all duration-200 hover:-translate-y-px active:translate-y-0";

const eyebrow =
  "mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em]";

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
  { label: "Monitoring", value: "24/7" },
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
      <span className="inline-block align-baseline overflow-visible">
        <span data-hero="word" className="inline-block">
          {word}
        </span>
      </span>{" "}
    </Fragment>
  ));
}

export function LandingPage() {
  return (
    <div className="ep-landing ep-business-landing flex min-h-screen flex-col">
      <LandingMotion />
      <PublicChromeMotion />
      <a
        href="#main"
        className={`sr-only z-[120] rounded-lg bg-[var(--ep-accent)] px-4 py-2 text-sm font-semibold text-[var(--ep-on-accent)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focusRing}`}
      >
        Skip to content
      </a>
      <SiteHeader tone="white" integrated />

      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {/* HERO */}
        <section id="top" className="ep-hero ep-hero--lens-hidden relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            data-hero="grid"
            className="pointer-events-none absolute inset-x-0 -top-[10%] -z-10 h-[120%] opacity-[0.16]"
            style={{
              backgroundImage:
                "radial-gradient(var(--ep-secondary) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              WebkitMaskImage:
                "radial-gradient(ellipse at 60% 40%, black 25%, transparent 72%)",
              maskImage:
                "radial-gradient(ellipse at 60% 40%, black 25%, transparent 72%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 ep-hero-atmosphere"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            {CROSSES.map((c) => (
              <span
                key={`${c.left}-${c.top}`}
                data-cross=""
                className="absolute h-4 w-4 opacity-[0.18]"
                style={{ left: c.left, top: c.top }}
              >
                <span className="absolute left-1/2 top-0 h-full w-px bg-[var(--ep-accent)]" />
                <span className="absolute left-0 top-1/2 h-px w-full bg-[var(--ep-accent)]" />
              </span>
            ))}
          </div>

          {/* The header is sticky (in flow), so the hero needs only a small top pad. */}
          <div className="ep-hero-layout mx-auto grid w-full max-w-[1440px] grid-cols-1 justify-items-center gap-5 px-5 pb-10 pt-32 sm:gap-6 sm:px-8 sm:pb-12 sm:pt-36 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:items-center lg:justify-items-stretch lg:gap-10 lg:px-12 lg:pb-16 lg:pt-36">
            <div
              data-hero="text"
              className="ep-hero-copy order-1 mx-auto w-full max-w-[900px] text-center lg:mx-auto lg:max-w-[660px]"
            >
              <h1
                data-hero="headline"
                aria-label="Smarter shrimp farming, always in range."
                className="ep-font-display mx-auto max-w-[1000px] text-[clamp(40px,6.4vw,88px)] font-bold leading-[1.02] tracking-[-0.055em] lg:mx-auto lg:text-[clamp(48px,5.2vw,76px)]"
              >
                <span className="block ep-hero-headline-primary">
                  <Words text="Smarter shrimp farming," />
                </span>
                <span className="block ep-hero-headline-secondary">
                  <Words text="always in range." />
                </span>
              </h1>

              <p
                data-hero="lead"
                className="mx-auto mt-5 max-w-[650px] text-base leading-[1.75] text-[var(--ep-text-muted)] sm:text-lg"
              >
                One platform for water monitoring, growth insights, and automated farm care.
              </p>

              <div
                data-hero="cta"
                className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
              >
                <AuthLink
                  className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--ep-accent)] bg-[var(--ep-accent)] px-6 py-3 text-sm font-semibold text-[var(--ep-on-accent)] shadow-sm hover:bg-[var(--ep-accent-hover)] ${buttonMotion} ${focusRing}`}
                >
                  Open dashboard
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center transition-transform duration-200 group-hover:translate-x-1"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </span>
                </AuthLink>
                <Link
                  to="/about"
                  className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-6 py-3 text-sm font-semibold text-[var(--ep-text)] shadow-sm hover:border-[var(--ep-accent)] hover:text-[var(--ep-accent)] ${buttonMotion} ${focusRing}`}
                  activeOptions={{ exact: true }}
                >
                  How it works
                </Link>
              </div>
            </div>

            <div
              data-hero="parallax-console"
              className="ep-hero-visual order-2 relative mx-auto flex w-full max-w-[390px] items-center justify-center sm:max-w-[420px] lg:max-w-[560px]"
            >
              <HeroLens />
            </div>
          </div>
        </section>

        {/* AT A GLANCE */}
        <section
          aria-label="EcoPrawn at a glance"
          className="border-y border-[var(--ep-line)] bg-[var(--ep-tint)] px-4 py-8 sm:px-8"
        >
          <div className="ep-stats-panel mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-2.5 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 shadow-[0_18px_45px_-30px_rgba(15,76,92,.42)] sm:grid-cols-4 sm:gap-3 sm:rounded-3xl sm:p-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-4 text-left"
              >
                <span className="block text-[clamp(20px,2.5vw,28px)] font-bold leading-none tracking-tight text-[var(--ep-primary)]">
                  {stat.value}
                </span>
                <span className="mt-2 block text-xs font-medium leading-snug text-[var(--ep-text-muted)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* WATER QUALITY: deep-water band, light text in both themes */}
        <section
          id="readings"
          aria-labelledby="readings-title"
          className="relative isolate overflow-hidden bg-[var(--ep-deep)] px-4 text-[var(--ep-on-deep)] sm:px-8"
        >
          <div
            aria-hidden="true"
            data-readings-bg=""
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 12% 8%, rgba(139,213,166,.16), transparent 42%), radial-gradient(ellipse at 88% 76%, rgba(0,0,0,.28), transparent 48%)",
            }}
          />

          <div className="mx-auto w-full max-w-[1200px] py-20 sm:py-24 lg:py-24">
            <div data-reveal="" className="max-w-[40rem]">
              <div className={`${eyebrow} text-[var(--ep-on-deep-muted)]`}>
                <span aria-hidden="true" className="h-2 w-2 bg-[var(--ep-zone)]" />
                Target ranges
              </div>
              <h2
                id="readings-title"
                className="ep-font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.12] tracking-tight"
              >
                Five readings, each held in range.
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-[var(--ep-on-deep-muted)]">
                Sample values from Tank 1, shown against the range shrimp need.
              </p>
            </div>

            <dl className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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
                    className="h-full rounded-2xl border border-white/20 bg-white/[0.07] p-5 transition-colors duration-200 hover:bg-white/[0.12]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <dt className="text-base font-semibold">{r.label}</dt>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/40 px-2 py-0.5 text-xs font-semibold">
                        {inRange ? (
                          <Icon name="check" size={12} strokeWidth={2.5} />
                        ) : (
                          <span aria-hidden="true">!</span>
                        )}
                        {inRange ? "In range" : "Out of range"}
                      </span>
                    </div>

                    <dd className="mt-3 text-4xl font-semibold tabular-nums">
                      <span data-countto={r.value}>{r.value}</span>
                      <span className="ml-1 text-base font-medium text-[var(--ep-on-deep-muted)]">
                        {heroReadoutUnits[r.label]}
                      </span>
                    </dd>

                    <div
                      aria-hidden="true"
                      className="relative mx-2 mt-6 h-2 rounded-full bg-white/25"
                    >
                      <div
                        data-zone=""
                        className="absolute inset-y-0 rounded-full bg-[var(--ep-zone)]"
                        style={{ left: `${zoneLeft}%`, width: `${zoneWidth}%` }}
                      />
                      <div
                        data-marker=""
                        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${markerLeft}%` }}
                      >
                        <span
                          data-ping=""
                          className="absolute inset-0 rounded-full border-2 border-[var(--ep-marker)] opacity-0"
                        />
                        <span className="absolute inset-0 rounded-full border-2 border-white bg-[var(--ep-marker)]" />
                      </div>
                    </div>

                    {zone && (
                      <div
                        aria-hidden="true"
                        className="mt-2.5 flex justify-between text-xs tabular-nums text-[var(--ep-on-deep-muted)]"
                      >
                        <span>{zone.min}</span>
                        <span>{zone.max}</span>
                      </div>
                    )}

                    {range && (
                      <p className="mt-2 text-sm text-[var(--ep-on-deep-muted)]">
                        Target {range}
                      </p>
                    )}
                  </div>
                );
              })}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-[var(--ep-on-deep-muted)]">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-8 rounded-full bg-[var(--ep-zone)]" />
                Target zone
              </span>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border-2 border-white bg-[var(--ep-marker)]" />
                Current reading
              </span>
            </div>
          </div>
        </section>

        {/* BUSINESS CAPABILITIES */}
        <section
          id="capabilities"
          aria-labelledby="capabilities-title"
          className="ep-business-capabilities bg-[var(--ep-bg)] px-4 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto w-full max-w-[1200px]">
            <div data-reveal="" className="mb-12 grid gap-5 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
              <div>
                <div className={`${eyebrow} text-[var(--ep-text-muted)]`}>
                  <span aria-hidden="true" className="h-2 w-2 bg-[var(--ep-accent)]" />
                  One connected platform
                </div>
                <h2 id="capabilities-title" className="ep-font-display max-w-[560px] text-[clamp(30px,4vw,48px)] font-semibold leading-[1.08] tracking-tight">
                  The essential parts of farm operations, working together.
                </h2>
              </div>
              <p className="max-w-[560px] text-base leading-relaxed text-[var(--ep-text-muted)] lg:justify-self-end lg:text-lg">
                EcoPrawn brings water monitoring, feeding, visual growth tracking, and effluent management into one operational workflow—so teams can understand what is happening and respond with better context.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <article data-business-card="" className="ep-capability-card group relative isolate min-h-[340px] overflow-hidden rounded-[1.5rem] border border-[var(--ep-line)] bg-[var(--ep-surface)] p-7 sm:p-8">
                <span aria-hidden="true" className="ep-capability-index absolute right-7 top-6 ep-font-display text-6xl font-semibold tracking-[-.08em] text-[var(--ep-text)] opacity-[.07]">01</span>
                <span className="ep-capability-icon mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ep-tint)] text-[var(--ep-secondary)]"><Icon name="activity" size={26} /></span>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[var(--ep-accent)]">01 / Monitor</p>
                <h3 className="ep-font-display mb-3 text-2xl font-semibold text-[var(--ep-text)]">Water quality intelligence</h3>
                <p className="text-sm leading-relaxed text-[var(--ep-text-muted)]">Track dissolved oxygen, pH, temperature, salinity, and water level against operating thresholds.</p>
              </article>
              <article data-business-card="" className="ep-capability-card group relative isolate min-h-[340px] overflow-hidden rounded-[1.5rem] border border-[var(--ep-line)] bg-[var(--ep-surface)] p-7 sm:p-8">
                <span aria-hidden="true" className="ep-capability-index absolute right-7 top-6 ep-font-display text-6xl font-semibold tracking-[-.08em] text-[var(--ep-text)] opacity-[.07]">02</span>
                <span className="ep-capability-icon mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ep-tint)] text-[var(--ep-secondary)]"><Icon name="eye" size={26} /></span>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[var(--ep-accent)]">02 / Understand</p>
                <h3 className="ep-font-display mb-3 text-2xl font-semibold text-[var(--ep-text)]">Growth and biomass insights</h3>
                <p className="text-sm leading-relaxed text-[var(--ep-text-muted)]">Use camera-based observation to follow shrimp growth and biomass without routine handling.</p>
              </article>
              <article data-business-card="" className="ep-capability-card group relative isolate min-h-[340px] overflow-hidden rounded-[1.5rem] border border-[var(--ep-line)] bg-[var(--ep-surface)] p-7 sm:p-8 md:col-span-2 lg:col-span-1">
                <span aria-hidden="true" className="ep-capability-index absolute right-7 top-6 ep-font-display text-6xl font-semibold tracking-[-.08em] text-[var(--ep-text)] opacity-[.07]">03</span>
                <span className="ep-capability-icon mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ep-tint)] text-[var(--ep-secondary)]"><Icon name="zap" size={26} /></span>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[var(--ep-accent)]">03 / Respond</p>
                <h3 className="ep-font-display mb-3 text-2xl font-semibold text-[var(--ep-text)]">Automated farm actions</h3>
                <p className="text-sm leading-relaxed text-[var(--ep-text-muted)]">Connect readings to aeration control and biomass-informed feeding for a more coordinated workflow.</p>
              </article>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-tint)] px-5 py-5 sm:px-7">
              <div>
                <p className="font-semibold text-[var(--ep-text)]">A more complete view of the production cycle</p>
                <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Includes biofloc and effluent routing for responsible water management.</p>
              </div>
              <Link to="/about" className={`inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-2 text-sm font-semibold text-[var(--ep-text)] hover:border-[var(--ep-accent)] hover:text-[var(--ep-accent)] ${focusRing}`}>
                View platform details <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* PROCESS: four stages on a single rule that fills as you scroll */}
        <section
          id="process"
          aria-labelledby="process-title"
          className="bg-[var(--ep-bg)] px-4 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px]">
            <div data-reveal="" className="mb-14 max-w-[40rem]">
              <div className={`${eyebrow} text-[var(--ep-text-muted)]`}>
                <span aria-hidden="true" className="h-2 w-2 bg-[var(--ep-accent)]" />
                The loop
              </div>
              <h2
                id="process-title"
                className="ep-font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.12] tracking-tight"
              >
                From sensor to mangrove.
              </h2>
            </div>

            <div data-process-viewport="" className="ep-process-viewport relative lg:border-t lg:border-[var(--ep-line)]">
              <span
                aria-hidden="true"
                data-process-line=""
                className="pointer-events-none absolute -top-px left-0 hidden h-0.5 w-full origin-left bg-[var(--ep-accent)] lg:block"
              />
              <ol data-process-track="" className="ep-process-track grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
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
                      className="absolute -top-[5px] left-0 hidden h-2.5 w-2.5 bg-[var(--ep-accent)] lg:block"
                    />
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-sm font-semibold tabular-nums tracking-wide text-[var(--ep-text-muted)]">
                        {s.step}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ep-tint)] text-[var(--ep-secondary)]">
                        <Icon name={s.icon} size={22} />
                      </span>
                    </div>
                    <h3 className="ep-font-display mb-2 text-2xl font-semibold text-[var(--ep-text)] transition-colors duration-200 group-hover:text-[var(--ep-accent)]">
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