import { Fragment, useEffect, useRef, useState } from "react";
import { PublicChromeMotion } from "@/components/motion/PublicChromeMotion";
import { Link } from "@tanstack/react-router";
import { AuthLink } from "@/features/auth/AuthModalProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CtaBand } from "@/components/CtaBand";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { LandingMotion } from "@/components/motion/LandingMotion";
import { HeroAquaticScene } from "./HeroAquaticScene";
import { AquacultureIllustration } from "@/components/illustrations/AquacultureIllustration";
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
  const [previewTab, setPreviewTab] = useState<"water" | "growth" | "systems">("water");
  const processDetailsRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const compactViewport = window.matchMedia("(max-width: 639px)");
    const syncProcessDetails = () => {
      processDetailsRef.current?.querySelectorAll("details").forEach((item) => {
        if (compactViewport.matches) item.removeAttribute("open");
        else item.setAttribute("open", "");
      });
    };

    syncProcessDetails();
    compactViewport.addEventListener("change", syncProcessDetails);
    return () => compactViewport.removeEventListener("change", syncProcessDetails);
  }, []);

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
        <section id="top" className="ep-hero ep-aquaculture-hero relative isolate overflow-hidden" aria-label="EcoPrawn smart aquaculture introduction">
          <HeroAquaticScene />
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
          {/* Centered editorial hero with a full-width farm landscape image. */}
          <div className="ep-field-hero mx-auto grid w-full max-w-[1440px] gap-10 px-5 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,.95fr)] lg:items-center lg:gap-12 lg:px-10 lg:pt-20">
            <div data-hero="text" className="ep-field-hero-copy mx-auto flex max-w-[920px] flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
              <p className="mb-5 inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[var(--ep-accent)] shadow-sm sm:text-[11px]">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--ep-accent)]" />
                REAL-TIME AQUACULTURE
              </p>
              <h1
                data-hero="headline"
                aria-label="Smarter shrimp farming, always in range."
                className="ep-font-display max-w-[900px] text-[clamp(40px,6.1vw,76px)] font-semibold leading-[1.02] tracking-[-0.065em]"
              >
                <span className="block ep-hero-headline-primary">Smarter Shrimp Farming</span>
                <span className="block ep-hero-headline-secondary">Always in Range</span>
              </h1>
              <p
                data-hero="lead"
                className="mx-auto mt-5 max-w-[620px] text-sm leading-[1.75] text-[var(--ep-text-muted)] sm:mt-6 sm:text-base"
              >
                Bringing water-quality monitoring, shrimp growth insights, and responsive farm operations together in one connected system.
              </p>
              <div data-hero="cta" className="mt-6 flex justify-center sm:mt-7">
                <AuthLink
                  mode="signin"
                  aria-label="Open dashboard sign in"
                  aria-haspopup="dialog"
                  title="Open dashboard sign in"
                  data-dashboard-entry=""
                  className={`group relative z-10 inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-full border border-[var(--ep-accent)] bg-[var(--ep-accent)] px-7 py-3 text-sm font-semibold text-[var(--ep-on-accent)] shadow-[0_10px_28px_-12px_rgba(29,78,216,.58)] transition-[transform,background-color,box-shadow] duration-300 ease-out hover:bg-[var(--ep-accent-hover)] hover:shadow-[0_16px_34px_-14px_rgba(29,78,216,.62)] active:scale-[.98] ${focusRing}`}
                >
                  Open dashboard
                  <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current/25 bg-white/10 text-current transition-colors duration-200">
                    <Icon name="arrow-up-right" size={16} strokeWidth={2.2} className="block shrink-0" />
                  </span>
                </AuthLink>
              </div>
            </div>

            <aside
              aria-label="Illustrative water monitoring panel"
              data-hero="monitor-panel"
              className="ep-hero-monitor-panel mx-auto w-full max-w-[560px] lg:mx-0 lg:max-w-none"
            >
              <div className="ep-hero-monitor-glow" aria-hidden="true" />
              <div className="relative z-10">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-200/75">Water intelligence</p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">Tank 1 · Sensor overview</h2>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-blue-100">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]" />
                    Sample data
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {heroReadouts.map((reading) => {
                    const range = targetRangeFor(reading.label) ?? "Target range not set";
                    return (
                      <div key={reading.label} className="ep-hero-sensor-tile min-w-0 rounded-xl border border-white/10 bg-white/[.055] px-3 py-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-100/75">
                          <span aria-hidden="true" data-hero-sensor-dot="" className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                          <span className="truncate">{reading.label}</span>
                        </div>
                        <p className="mt-2 whitespace-nowrap text-[clamp(18px,2vw,25px)] font-semibold leading-none tracking-tight text-white tabular-nums">
                          {reading.value}<span className="ml-1 text-[10px] font-medium text-blue-100/65">{heroReadoutUnits[reading.label]}</span>
                        </p>
                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                          <span data-hero-sensor-bar="" className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${reading.pct}%` }} />
                        </div>
                        <p className="mt-2 truncate text-[9px] leading-tight text-blue-100/65" title={range}>Target {range}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[10px] text-blue-100/65">
                  <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 5 sensor indicators</span>
                  <span>Illustrative preview · Not live telemetry</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* PLATFORM SIGNALS */}
        <section aria-label="Connected EcoPrawn capabilities" className="ep-platform-ribbon border-y border-[var(--ep-line)] bg-[var(--ep-surface)] px-5 py-5 sm:px-8">
          <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-0">
            {[
              { number: "01", label: "Monitor", detail: "Water conditions" },
              { number: "02", label: "Understand", detail: "Growth and biomass" },
              { number: "03", label: "Respond", detail: "Coordinated farm actions" },
            ].map((item, index) => (
              <div key={item.number} className="ep-platform-ribbon-item flex items-center gap-4 px-2 py-2 sm:px-6">
                <span className="ep-platform-ribbon-number">{item.number}</span>
                <span className="min-w-0">
                  <strong className="block text-sm font-semibold text-[var(--ep-text)]">{item.label}</strong>
                  <span className="mt-0.5 block text-xs text-[var(--ep-text-muted)]">{item.detail}</span>
                </span>
                {index !== 2 && <span aria-hidden="true" className="ep-platform-ribbon-divider hidden sm:block" />}
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Connected aquaculture overview" className="ep-illustration-strip border-b border-[var(--ep-line)] bg-[var(--ep-tint)] px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="max-w-[34rem] text-center sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--ep-accent)]">Connected aquaculture</p>
              <p className="mt-1 text-sm font-medium text-[var(--ep-text-muted)] sm:text-base">A clearer view of water conditions, growth, and farm operations.</p>
            </div>
            <AquacultureIllustration variant="landing" />
          </div>
        </section>

        {/* AT A GLANCE */}
        <section
          aria-label="EcoPrawn at a glance"
          className="border-y border-[var(--ep-line)] bg-[var(--ep-tint)] px-5 py-8 sm:px-8"
        >
          <div className="ep-stats-panel mx-auto grid max-w-[1440px] grid-cols-2 gap-2.5 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 shadow-[0_18px_45px_-30px_rgba(15,23,42,.18)] sm:grid-cols-4 sm:gap-3 sm:rounded-3xl sm:p-4">
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
          className="ep-readings-section relative isolate overflow-hidden"
        >
          <div
            aria-hidden="true"
            data-readings-bg=""
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 12% 8%, rgba(96,165,250,.10), transparent 42%), radial-gradient(ellipse at 88% 76%, rgba(0,0,0,.28), transparent 48%)",
            }}
          />

          <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-24">
            <div data-reveal="" className="ep-readings-intro max-w-[40rem]">
              <div className={`${eyebrow} ep-readings-kicker`}>
                <span aria-hidden="true" className="h-2 w-2 bg-[var(--ep-zone)]" />
                Target ranges
              </div>
              <h2
                id="readings-title"
                className="ep-readings-title ep-font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.12] tracking-tight"
              >
                Five readings, each held in range.
              </h2>
              <p className="ep-readings-description mt-3 text-lg leading-relaxed">
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
                    className="ep-reading-card h-full rounded-2xl border p-5 transition-colors duration-200"
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
          className="ep-business-capabilities bg-[var(--ep-bg)] px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto w-full max-w-[1440px]">
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
              <article data-business-card="" className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6">
                <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-secondary)]"><Icon name="activity" size={24} /></span>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[var(--ep-accent)]">01 / Monitor</p>
                <h3 className="ep-font-display mb-3 text-2xl font-semibold text-[var(--ep-text)]">Water quality intelligence</h3>
                <p className="text-sm leading-relaxed text-[var(--ep-text-muted)]">Track dissolved oxygen, pH, temperature, salinity, and water level against operating thresholds.</p>
                <div data-capability-detail="" className="mt-7 flex items-center justify-between gap-3 border-t border-[var(--ep-line)] pt-4"><span className="text-xs font-semibold text-[var(--ep-text)]">5 water parameters</span><span aria-hidden="true" className="flex items-end gap-1"><i className="h-3 w-1.5 rounded-full bg-[var(--ep-accent)]/45" /><i className="h-5 w-1.5 rounded-full bg-[var(--ep-accent)]/70" /><i className="h-4 w-1.5 rounded-full bg-[var(--ep-accent)]" /><i className="h-6 w-1.5 rounded-full bg-[var(--ep-accent)]/70" /><i className="h-3 w-1.5 rounded-full bg-[var(--ep-accent)]/45" /></span></div>
              </article>
              <article data-business-card="" className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6">
                <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-secondary)]"><Icon name="eye" size={24} /></span>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[var(--ep-accent)]">02 / Understand</p>
                <h3 className="ep-font-display mb-3 text-2xl font-semibold text-[var(--ep-text)]">Growth and biomass insights</h3>
                <p className="text-sm leading-relaxed text-[var(--ep-text-muted)]">Use camera-based observation to follow shrimp growth and biomass without routine handling.</p>
                <div data-capability-detail="" className="mt-7 flex items-center justify-between gap-3 border-t border-[var(--ep-line)] pt-4"><span className="text-xs font-semibold text-[var(--ep-text)]">Camera-based observation</span><span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full border border-[var(--ep-accent)]/30 text-[var(--ep-accent)]"><Icon name="camera" size={15} /></span></div>
              </article>
              <article data-business-card="" className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 md:col-span-2 lg:col-span-1">
                <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-secondary)]"><Icon name="zap" size={24} /></span>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[var(--ep-accent)]">03 / Respond</p>
                <h3 className="ep-font-display mb-3 text-2xl font-semibold text-[var(--ep-text)]">Automated farm actions</h3>
                <p className="text-sm leading-relaxed text-[var(--ep-text-muted)]">Connect readings to aeration control and biomass-informed feeding for a more coordinated workflow.</p>
                <div data-capability-detail="" className="mt-7 flex items-center justify-between gap-3 border-t border-[var(--ep-line)] pt-4"><span className="text-xs font-semibold text-[var(--ep-text)]">Aeration + feeding workflow</span><span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full border border-[var(--ep-accent)]/30 text-[var(--ep-accent)]"><Icon name="repeat" size={15} /></span></div>
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

        {/* DASHBOARD PREVIEW: illustrative sample values, not live telemetry. */}
        <section
          id="dashboard-preview"
          aria-labelledby="dashboard-preview-title"
          className="ep-dashboard-preview ep-inside-platform border-y border-[var(--ep-line)] bg-[var(--ep-bg)] px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto grid w-full max-w-[1440px] min-w-0 items-center gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
            <div data-reveal="" className="max-w-[34rem]">
              <div className={`${eyebrow} text-[var(--ep-text-muted)]`}>
                <span aria-hidden="true" className="h-2 w-2 bg-[var(--ep-accent)]" />
                Inside the platform
              </div>
              <h2
                id="dashboard-preview-title"
                className="ep-font-display text-[clamp(30px,4vw,48px)] font-semibold leading-[1.08] tracking-tight text-[var(--ep-text)]"
              >
                A clearer picture of every tank.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--ep-text-muted)] sm:text-lg">
                Bring key water-quality readings and operating context into one view, so your team can spot changes and make informed decisions.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to="/dashboard" className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--ep-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--ep-on-accent)] shadow-lg shadow-blue-600/15 transition-colors duration-200 hover:bg-[var(--ep-accent-hover)] ${focusRing}`}>
                  Explore dashboard <Icon name="arrow-up-right" size={16} />
                </Link>
                <span className="text-xs text-[var(--ep-text-muted)]">Illustrative interface preview</span>
              </div>
            </div>

            <div role="group" aria-label="Illustrative EcoPrawn monitoring dashboard preview" className="ep-dashboard-preview-window min-w-0 overflow-hidden rounded-[1.5rem] border border-[var(--ep-line)] bg-[var(--ep-surface)] shadow-[0_30px_80px_-42px_rgba(15,23,42,.42)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ep-line)] px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--ep-accent)] text-white"><Icon name="activity" size={19} /></span>
                  <div>
                    <p className="text-sm font-bold text-[var(--ep-text)]">Farm overview</p>
                    <p className="text-xs text-[var(--ep-text-muted)]">Tank 1 · Monitoring snapshot</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--ep-text-muted)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--ep-accent)]" />
                  Sample preview
                </span>
              </div>

              <div className="ep-preview-tab-list" aria-label="Choose a dashboard preview" role="group">
                {([
                  { id: "water", label: "Water Quality" },
                  { id: "growth", label: "Growth Insights" },
                  { id: "systems", label: "Farm Systems" },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className="ep-preview-tab"
                    aria-pressed={previewTab === tab.id}
                    onClick={() => setPreviewTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div
                className="ep-preview-tab-panel"
                role="region"
                aria-label={
                  previewTab === "water"
                    ? "Water quality sample preview"
                    : previewTab === "growth"
                      ? "Growth insights concept preview"
                      : "Farm systems concept preview"
                }
                aria-live="polite"
              >
                {previewTab === "water" ? (
                  <>
                                <div data-preview-kpis="" className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
                                  {heroReadouts.slice(0, 3).map((reading) => {
                                    const range = targetRangeFor(reading.label);
                                    return (
                                      <div data-preview-reading="" key={reading.label} className="min-w-0 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-4">
                                        <div className="flex items-center justify-between gap-2">
                                          <p className="text-xs font-semibold text-[var(--ep-text-muted)]">{reading.label}</p>
                                          <span className="rounded-full bg-[var(--ep-tint)] px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[var(--ep-text-muted)]">Sample</span>
                                        </div>
                                        <p className="mt-2 text-[clamp(1.45rem,2.4vw,1.9rem)] font-bold leading-none tracking-tight tabular-nums text-[var(--ep-text)]">
                                          {reading.value}<span className="ml-1 text-xs font-semibold text-[var(--ep-text-muted)]">{heroReadoutUnits[reading.label]}</span>
                                        </p>
                                        {range && <p className="mt-3 border-t border-[var(--ep-line)] pt-2 text-[11px] leading-relaxed text-[var(--ep-text-muted)]">Target {range}</p>}
                                        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ep-accent)]">
                                          <Icon name="check" size={12} /> Within sample target
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                  
                                <div className="grid gap-4 px-4 pb-5 sm:grid-cols-[1.4fr_.8fr] sm:px-5">
                                  <div className="min-w-0 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <p className="text-sm font-semibold text-[var(--ep-text)]">Water quality trend</p>
                                      <span className="rounded-full border border-[var(--ep-line)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[var(--ep-text-muted)]">Illustrative</span>
                                    </div>
                                    <div className="ep-preview-chart mt-4 flex h-28 items-end gap-2" aria-hidden="true">
                                      {[34, 48, 42, 62, 54, 73, 66, 84, 76, 92, 82, 96].map((height, index) => (
                                        <span key={index} style={{ height: `${height}%` }} />
                                      ))}
                                    </div>
                                    <p className="mt-3 text-[10px] leading-relaxed text-[var(--ep-text-muted)]">Illustrative pattern only — not historical telemetry.</p>
                                  </div>
                                  <div className="min-w-0 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-4">
                                    <p className="text-sm font-semibold text-[var(--ep-text)]">Platform modules</p>
                                    <div className="mt-4 space-y-3">
                                      <div className="flex items-center gap-3 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3">
                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--ep-tint)] text-[var(--ep-accent)]"><Icon name="activity" size={16} /></span>
                                        <span className="min-w-0"><span className="block text-xs font-semibold text-[var(--ep-text)]">Water monitoring</span><span className="mt-0.5 block text-[10px] text-[var(--ep-text-muted)]">Sensor readings and target ranges</span></span>
                                      </div>
                                      <div className="flex items-center gap-3 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3">
                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--ep-tint)] text-[var(--ep-accent)]"><Icon name="eye" size={16} /></span>
                                        <span className="min-w-0"><span className="block text-xs font-semibold text-[var(--ep-text)]">Growth insights</span><span className="mt-0.5 block text-[10px] text-[var(--ep-text-muted)]">Visual growth and biomass context</span></span>
                                      </div>
                                    </div>
                                    <p className="mt-4 border-t border-[var(--ep-line)] pt-3 text-[10px] leading-relaxed text-[var(--ep-text-muted)]">Concept preview only. Values and visual patterns are illustrative, not live farm data.</p>
                                  </div>
                                </div>
                  </>
                ) : previewTab === "growth" ? (
                  <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                    <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-5">
                      <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-accent)]"><Icon name="eye" size={20} /></span>
                      <p className="text-sm font-semibold text-[var(--ep-text)]">Camera-based observation</p>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--ep-text-muted)]">A visual approach to observing shrimp growth without routine handling.</p>
                    </div>
                    <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-5">
                      <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-accent)]"><Icon name="camera" size={20} /></span>
                      <p className="text-sm font-semibold text-[var(--ep-text)]">Growth and biomass context</p>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--ep-text-muted)]">Visual insights can help teams understand growth patterns and inform feeding decisions.</p>
                    </div>
                    <p className="sm:col-span-2 rounded-lg border border-dashed border-[var(--ep-line)] px-4 py-3 text-xs leading-relaxed text-[var(--ep-text-muted)]">Concept view only. No live camera feed, measured biomass, or real growth history is displayed.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
                    {[
                      { icon: "activity" as const, title: "Aeration", detail: "Aerator response based on operating conditions." },
                      { icon: "zap" as const, title: "Feeding", detail: "Feeding workflow informed by biomass context." },
                      { icon: "leaf" as const, title: "Effluent", detail: "Treated wastewater routing to mangrove and wetland." },
                    ].map((item) => (
                      <div key={item.title} className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-4">
                        <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-accent)]"><Icon name={item.icon} size={19} /></span>
                        <p className="text-sm font-semibold text-[var(--ep-text)]">{item.title}</p>
                        <p className="mt-2 text-xs leading-relaxed text-[var(--ep-text-muted)]">{item.detail}</p>
                      </div>
                    ))}
                    <p className="sm:col-span-3 rounded-lg border border-dashed border-[var(--ep-line)] px-4 py-3 text-xs leading-relaxed text-[var(--ep-text-muted)]">Concept view only. This preview does not control equipment or report live system status.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS: four stages in a responsive, static grid */}
        <section
          id="process"
          aria-labelledby="process-title"
          className="bg-[var(--ep-bg)] px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto w-full max-w-[1440px]">
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
              <ol ref={processDetailsRef} data-process-track="" className="ep-process-track grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {STEPS.map((s) => (
                  <li
                    key={s.step}
                    data-step=""
                    data-hover-lift=""
                    className="group relative border-t border-[var(--ep-line)] pt-4 transition-colors duration-200 hover:border-[var(--ep-accent)] lg:border-t-0 lg:pt-8"
                  >
                    <span
                      aria-hidden="true"
                      data-step-node=""
                      className="absolute -top-[5px] left-0 hidden h-2.5 w-2.5 bg-[var(--ep-accent)] lg:block"
                    />
                    <details open className="ep-process-disclosure">
                      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                        <span className="text-xs font-semibold tabular-nums tracking-wide text-[var(--ep-text-muted)]">
                          {s.step}
                        </span>
                        <span className="ep-font-display min-w-0 flex-1 text-lg font-semibold text-[var(--ep-text)] transition-colors duration-200 group-hover:text-[var(--ep-accent)]">
                          {s.title}
                        </span>
                        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ep-tint)] text-[var(--ep-secondary)]">
                          <Icon name={s.icon} size={19} />
                        </span>
                        <span aria-hidden="true" className="ep-process-disclosure-indicator ml-1 text-sm text-[var(--ep-text-muted)]">+</span>
                      </summary>
                      <p className="ep-process-disclosure-body pt-2 text-sm leading-relaxed text-[var(--ep-text-muted)] sm:text-base">
                        {s.body}
                      </p>
                    </details>
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