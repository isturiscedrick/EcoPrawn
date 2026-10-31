import { Fragment } from "react";
import Link from "next/link";
import { HeroLens } from "@/features/landing/HeroLens";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CtaBand } from "@/components/CtaBand";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { LandingMotion } from "@/components/motion/LandingMotion";
import { AuthLink } from "@/features/auth/AuthModalProvider";
import { heroReadoutUnits } from "@/config/sensors";
import { heroReadouts, waterQualityThresholds } from "@/content/landing-preview";

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

const buttonMotion =
  "transition-all duration-200 hover:-translate-y-px active:translate-y-0";

const eyebrow =
  "mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]";

const STEPS: { step: string; title: string; body: string; icon: IconName }[] = [
  { step: "01", title: "Sense", icon: "activity", body: "Five sensors stream water readings around the clock." },
  { step: "02", title: "Analyze", icon: "eye", body: "Cameras estimate shrimp growth and biomass without handling." },
  { step: "03", title: "Act", icon: "zap", body: "Aerators start automatically. Feed follows biomass." },
  { step: "04", title: "Return", icon: "leaf", body: "Treated wastewater is routed to mangrove and wetland." },
];

const STATS = [
  { label: "Parameters tracked", value: String(heroReadouts.length) },
  { label: "Aeration", value: "Automatic" },
  { label: "Growth vision", value: "No handling" },
];

// Gauge scale and target zone per reading, used only to draw the range bars.
// Same numbers as the dashboard thresholds.
const ZONES: Record<string, { min: number; max: number; lo: number; hi: number }> = {
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
      <span className="inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]">
        <span data-hero="word" className="inline-block">
          {word}
        </span>
      </span>{" "}
    </Fragment>
  ));
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ep-bg)] text-[var(--ep-primary)]">
      <LandingMotion />
      <SiteHeader />

      <main className="flex-1">
        {/* HERO: cream (60%) with a faint blueprint grid and one coral accent */}
        <section id="top" className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            data-hero="grid"
            className="pointer-events-none absolute inset-x-0 -top-[10%] -z-10 h-[120%] opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(var(--ep-primary) 1px, transparent 1px), linear-gradient(90deg, var(--ep-primary) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              WebkitMaskImage: "radial-gradient(ellipse at 60% 40%, black 25%, transparent 72%)",
              maskImage: "radial-gradient(ellipse at 60% 40%, black 25%, transparent 72%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(640px circle at 82% 30%, rgba(95,184,196,0.16), transparent 62%), radial-gradient(520px circle at 8% 95%, rgba(178,63,28,0.07), transparent 60%)",
            }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
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

          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 sm:px-8 md:grid-cols-[1.05fr_0.95fr] md:gap-14 lg:py-24">
            <div data-hero="text">
              <div
                data-hero="eyebrow"
                className="mb-7 inline-flex items-center gap-3 border-l-2 border-[var(--ep-accent)] pl-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]"
              >
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span
                    data-live-ping=""
                    className="absolute inline-flex h-full w-full rounded-full bg-[var(--ep-ok)] opacity-60"
                  />
                  <span className="relative h-2 w-2 rounded-full bg-[var(--ep-ok)]" />
                </span>
                Live monitoring · 24/7
              </div>

              <h1
                aria-label="Indoor shrimp farming, always in range."
                className="ep-font-display text-[clamp(40px,5.4vw,68px)] font-semibold leading-[1.06] tracking-tight"
              >
                <span aria-hidden="true">
                  <Words text="Indoor shrimp farming," />
                  <span className="block text-[var(--ep-accent)]">
                    <Words text="always in range." />
                  </span>
                </span>
              </h1>

              <p
                data-hero="lead"
                className="mt-6 max-w-[32rem] text-lg leading-relaxed text-[var(--ep-text-muted)]"
              >
                Live water quality, automatic feeding, and AI growth tracking in one dashboard.
              </p>

              <div data-hero="cta" className="mt-9 flex flex-col gap-3 sm:flex-row">
                <AuthLink
                  className={`group inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[var(--ep-accent)] bg-[var(--ep-accent)] px-7 py-3.5 text-base font-semibold text-white hover:border-[var(--ep-accent-hover)] hover:bg-[var(--ep-accent-hover)] ${buttonMotion} ${focusRing}`}
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
                  href="/about"
                  className={`inline-flex items-center justify-center rounded-lg border-2 border-[var(--ep-primary)] px-7 py-3.5 text-base font-semibold text-[var(--ep-primary)] hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] ${buttonMotion} ${focusRing}`}
                >
                  See how it works
                </Link>
              </div>

              <dl className="relative mt-12 grid grid-cols-1 gap-5 pt-6 sm:grid-cols-3">
                <span
                  aria-hidden="true"
                  data-hero="statline"
                  className="absolute inset-x-0 top-0 h-px bg-[var(--ep-primary)]"
                />
                {STATS.map((s) => (
                  <div key={s.label} data-hero="stat">
                    <dt className="text-sm font-semibold text-[var(--ep-text-muted)]">{s.label}</dt>
                    <dd className="ep-font-display mt-1 text-2xl font-semibold tabular-nums">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div data-hero="parallax-console" className="relative mx-auto w-full max-w-[480px]">
              <div data-hero="console">
                <HeroLens />
              </div>
            </div>
          </div>
        </section>

        {/* READINGS: deep teal (30%). Each reading shown against its target zone. */}
        <section
          id="readings"
          aria-labelledby="readings-title"
          className="relative isolate overflow-hidden border-y border-[var(--ep-primary)] bg-[var(--ep-primary)] text-[var(--ep-bg)]"
        >
          <div
            aria-hidden="true"
            data-readings-bg=""
            className="pointer-events-none absolute inset-x-0 -top-[10%] -z-10 h-[120%] opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(var(--ep-bg) 1px, transparent 1px), linear-gradient(90deg, var(--ep-bg) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              WebkitMaskImage: "radial-gradient(ellipse at 30% 0%, black 20%, transparent 70%)",
              maskImage: "radial-gradient(ellipse at 30% 0%, black 20%, transparent 70%)",
            }}
          />

          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-24">
            <div data-reveal="" className="max-w-[40rem]">
              <div className={`${eyebrow} !text-[rgba(242,235,221,0.85)]`}>
                <span aria-hidden="true" className="h-2 w-2 bg-[var(--coral)]" />
                Target ranges
              </div>
              <h2
                id="readings-title"
                className="ep-font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.12] tracking-tight"
              >
                Five readings, each held in range.
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-[rgba(242,235,221,0.88)]">
                Sample values from Tank 1, shown against the range shrimp need.
              </p>
            </div>

            <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-5">
              {heroReadouts.map((r) => {
                const zone = ZONES[r.label];
                const value = parseFloat(r.value);
                const zoneLeft = zone ? pct(zone.lo, zone.min, zone.max) : 0;
                const zoneWidth = zone ? pct(zone.hi, zone.min, zone.max) - zoneLeft : 0;
                const markerLeft = zone ? pct(value, zone.min, zone.max) : 0;
                const range = targetRangeFor(r.label);
                return (
                  <div
                    key={r.label}
                    data-reading=""
                    className="border-t border-[rgba(242,235,221,0.3)] pt-5 last:col-span-2 md:last:col-span-1"
                  >
                    <dt className="text-base font-semibold text-[rgba(242,235,221,0.92)]">{r.label}</dt>
                    <dd className="mt-2 text-4xl font-semibold tabular-nums">
                      <span data-countto={r.value}>{r.value}</span>
                      <span className="ml-1 text-base font-medium text-[rgba(242,235,221,0.8)]">
                        {heroReadoutUnits[r.label]}
                      </span>
                    </dd>

                    <div
                      aria-hidden="true"
                      className="relative mt-6 h-2 rounded-full bg-[rgba(242,235,221,0.16)]"
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

                    {range && (
                      <p className="mt-3 text-sm text-[rgba(242,235,221,0.85)]">Target {range}</p>
                    )}
                  </div>
                );
              })}
            </dl>
          </div>
        </section>

        {/* PROCESS: four stages on a single rule that fills as you scroll */}
        <section
          id="process"
          aria-labelledby="process-title"
          className="px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px]">
            <div data-reveal="" className="mb-14 max-w-[40rem]">
              <div className={eyebrow}>
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
                    className="relative border-t border-[var(--ep-line)] pt-8 lg:border-t-0"
                  >
                    <span
                      aria-hidden="true"
                      data-step-node=""
                      className="absolute -top-[5px] left-0 hidden h-2.5 w-2.5 bg-[var(--ep-primary)] lg:block"
                    />
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-sm font-semibold tabular-nums tracking-wide text-[var(--ep-text-muted)]">
                        {s.step}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--ep-primary)] text-[var(--ep-primary)]">
                        <Icon name={s.icon} size={22} />
                      </span>
                    </div>
                    <h3 className="ep-font-display mb-2 text-2xl font-semibold">{s.title}</h3>
                    <p className="text-base leading-relaxed text-[var(--ep-text-muted)]">{s.body}</p>
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