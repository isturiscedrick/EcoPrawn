import Link from "next/link";
import { TankHeroSvg } from "@/features/dashboard/TankHeroSvg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CtaBand } from "@/components/CtaBand";
import { Icon, IconChip, type IconName } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { Bubbles } from "@/components/illustrations/Bubbles";
import { WaveEdge } from "@/components/illustrations/WaveEdge";
import { AuthLink } from "@/features/auth/AuthModalProvider";
import {
  heroReadouts,
  heroReadoutUnits,
  waterQualityThresholds,
  tanks,
  feedByTank,
  alerts,
} from "@/data/ecoprawn";

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

const buttonMotion =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(11,46,51,0.6)] active:translate-y-0 active:shadow-none";

const STEPS: { step: string; title: string; body: string; icon: IconName }[] = [
  {
    step: "01",
    title: "Sense",
    icon: "activity",
    body: "Dissolved oxygen, pH, temperature, salinity, and water level sensors stream telemetry to an on-site server and cloud database.",
  },
  {
    step: "02",
    title: "Analyze",
    icon: "eye",
    body: "Machine learning models estimate shrimp growth and biomass directly from camera feeds, with no physical handling.",
  },
  {
    step: "03",
    title: "Act",
    icon: "zap",
    body: "Aerators activate automatically when a parameter crosses its threshold, and feed is dispensed on a biomass-adjusted schedule.",
  },
  {
    step: "04",
    title: "Return",
    icon: "leaf",
    body: "Bio-rich wastewater from the biofloc loop is routed to surrounding mangrove and wetland vegetation.",
  },
];

const PREVIEW_POINTS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "activity",
    title: "Live water quality",
    body: "Oxygen, pH, temperature, salinity, and water level, each checked against its target range.",
  },
  {
    icon: "utensils",
    title: "Feeding on schedule",
    body: "See what was dispensed today and what is coming up next.",
  },
  {
    icon: "eye",
    title: "Growth from camera feeds",
    body: "Body length, weight, and population estimated without handling the shrimp.",
  },
];

// Same sample series the dashboard trend chart used before it read real data.
const PREVIEW_TREND =
  "0,90 40,84 80,88 120,70 160,76 200,60 240,66 280,50 320,58 360,44 400,52 440,40 480,46 520,36 560,42";

function targetRangeFor(label: string): string | undefined {
  return waterQualityThresholds.find((t) => t.label === label)?.range;
}

export function LandingPage() {
  const previewKpis = [
    {
      label: heroReadouts[0].label,
      value: `${heroReadouts[0].value} ${heroReadoutUnits[heroReadouts[0].label]}`,
    },
    { label: "Biomass", value: tanks[0].biomass },
    { label: "Feed conversion", value: feedByTank[0].fcr },
  ];
  const previewAlert = alerts[0];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ep-bg)] text-[var(--ep-primary)]">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO: cream background (60%), coral accent on one phrase and one button (10%) */}
        <section id="top" className="relative isolate overflow-hidden">
          {/* Depth: soft coral/green glows plus a faint grid that fades toward the edges */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(600px circle at 85% 20%, rgba(178,63,28,0.10), transparent 60%), radial-gradient(700px circle at 10% 90%, rgba(30,122,70,0.08), transparent 60%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(var(--ep-primary) 1px, transparent 1px), linear-gradient(90deg, var(--ep-primary) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />

          <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 md:gap-12 lg:py-20">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[var(--ep-primary)] bg-white px-3.5 py-1.5 text-sm font-semibold">
                <span
                  aria-hidden="true"
                  className="ep-pulse-dot h-2 w-2 rounded-full bg-[var(--ep-ok)]"
                />
                Live monitoring · 24/7
              </div>

              <h1 className="ep-font-display text-[clamp(40px,5.5vw,64px)] font-semibold leading-[1.1] tracking-tight">
                Indoor shrimp farming,{" "}
                <span className="text-[var(--ep-accent)]">always in range.</span>
              </h1>

              <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-[var(--ep-text-muted)]">
                Live water quality, automated feeding, and AI growth tracking for
                your tanks, all in one dashboard.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <AuthLink
                  className={`group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--ep-accent)] bg-[var(--ep-accent)] px-7 py-3.5 text-base font-semibold text-white hover:border-[var(--ep-accent-hover)] hover:bg-[var(--ep-accent-hover)] ${buttonMotion} ${focusRing}`}
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
                  className={`inline-flex items-center justify-center rounded-xl border-2 border-[var(--ep-primary)] px-7 py-3.5 text-base font-semibold text-[var(--ep-primary)] hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] ${buttonMotion} ${focusRing}`}
                >
                  See how it works
                </Link>
              </div>

              {/* Proof row */}
              <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--ep-line)] pt-6 text-sm font-semibold">
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-[var(--ep-accent)]">●</span>
                  {heroReadouts.length} parameters tracked
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-[var(--ep-accent)]">●</span>
                  Auto-aeration
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-[var(--ep-accent)]">●</span>
                  Handling-free AI vision
                </li>
              </ul>
            </div>

            {/* Tank visual: ink panel (30%) with coral offset shadow and a floating reading */}
            <div className="relative mx-auto w-full max-w-[460px]">
              <div
                aria-hidden="true"
                className="flex h-[340px] w-full items-center justify-center rounded-3xl border-2 border-[var(--ep-primary)] bg-[var(--ep-primary)] p-4 shadow-[10px_10px_0_0_var(--ep-accent)] sm:h-[420px] md:h-[460px] [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full"
              >
                <TankHeroSvg />
              </div>

              <div className="absolute bottom-6 left-3 rounded-2xl border-2 border-[var(--ep-primary)] bg-white px-4 py-3 shadow-[0_12px_28px_-12px_rgba(11,46,51,0.5)] sm:-left-6">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">
                  {heroReadouts[0].label}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-2xl font-semibold tabular-nums">
                  {heroReadouts[0].value}
                  <span className="text-sm font-medium">
                    {heroReadoutUnits[heroReadouts[0].label]}
                  </span>
                  <span
                    aria-hidden="true"
                    className="ep-pulse-dot ml-1 h-2 w-2 rounded-full bg-[var(--ep-ok)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* READINGS: deep-water band with wavy edges, rising bubbles, and a gauge bar per reading */}
        <section
          aria-labelledby="readings-title"
          className="relative isolate bg-[var(--ep-primary)] text-[var(--ep-bg)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(700px circle at 15% 100%, rgba(95,184,196,0.2), transparent 60%), linear-gradient(180deg, var(--ep-primary) 0%, var(--ep-primary-soft) 100%)",
            }}
          />
          <Bubbles />
          {/* Top: a dark wave that rises over the hero's bottom edge, so it never has to match the hero's glows */}
          <WaveEdge className="bottom-[calc(100%-1px)] z-20 text-[var(--ep-primary)]" />
          {/* Bottom: a sand wave that matches the dashboard-preview section below */}
          <WaveEdge className="bottom-[-1px] z-20 text-[var(--ep-tint)]" />

          <div className="relative z-10 mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-24">
            <h2
              id="readings-title"
              className="ep-font-display text-[clamp(24px,3vw,32px)] font-semibold tracking-tight"
            >
              Tank 1, latest readings
            </h2>
            <p className="mt-2 max-w-[34rem] text-base leading-relaxed text-[rgba(242,235,221,0.78)]">
              Each reading is shown against the range the shrimp need to stay healthy.
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5">
              {heroReadouts.map((readout) => {
                const range = targetRangeFor(readout.label);
                return (
                  <div key={readout.label} className="last:col-span-2 md:last:col-span-1">
                    <dt className="text-sm font-semibold text-[rgba(242,235,221,0.82)]">
                      {readout.label}
                    </dt>
                    <dd className="mt-1 text-4xl font-semibold tabular-nums">
                      {readout.value}
                      <span className="ml-1 text-base font-medium text-[rgba(242,235,221,0.72)]">
                        {heroReadoutUnits[readout.label]}
                      </span>
                    </dd>
                    <div
                      aria-hidden="true"
                      className="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgba(242,235,221,0.16)]"
                    >
                      <div
                        className={`h-full rounded-full ${
                          readout.status === "ok" ? "bg-[var(--mangrove-light)]" : "bg-[var(--amber)]"
                        }`}
                        style={{ width: `${readout.pct}%` }}
                      />
                    </div>
                    {range && (
                      <p className="mt-2 text-sm text-[rgba(242,235,221,0.72)]">Target {range}</p>
                    )}
                  </div>
                );
              })}
            </dl>
          </div>
        </section>

        {/* DASHBOARD PREVIEW: sample data from the same file as the hero readings */}
        <section
          aria-labelledby="preview-title"
          className="bg-[var(--ep-tint)] px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <h2
                id="preview-title"
                className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.1] tracking-tight"
              >
                Everything about the tank, on one screen.
              </h2>
              <p className="mt-4 max-w-[34rem] text-lg leading-relaxed text-[var(--ep-text-muted)]">
                Readings, feeding, growth, and alerts sit side by side, so you can
                see what needs attention without opening anything else.
              </p>

              <ul className="mt-8 flex flex-col gap-5">
                {PREVIEW_POINTS.map((p) => (
                  <li key={p.title} className="flex gap-4">
                    <IconChip name={p.icon} tone="mangrove" size={20} />
                    <div>
                      <div className="text-base font-semibold">{p.title}</div>
                      <p className="mt-0.5 text-base leading-relaxed text-[var(--ep-text-muted)]">
                        {p.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div
              aria-hidden="true"
              className="overflow-hidden rounded-2xl border-2 border-[var(--ep-primary)] bg-[var(--ep-surface)] shadow-[10px_10px_0_0_var(--ep-primary)]"
            >
              <div className="flex items-center gap-1.5 border-b-2 border-[var(--ep-primary)] bg-[var(--ep-bg)] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--ep-line)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--ep-line)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--ep-line)]" />
                <span className="ml-3 text-xs font-semibold text-[var(--ep-text-muted)]">
                  Tank overview
                </span>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-3">
                  {previewKpis.map((k) => (
                    <div
                      key={k.label}
                      className="rounded-xl border-2 border-[var(--ep-line)] p-3"
                    >
                      <div className="text-xs font-semibold text-[var(--ep-text-muted)]">
                        {k.label}
                      </div>
                      <div className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">
                        {k.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border-2 border-[var(--ep-line)] p-4">
                  <div className="mb-2 text-sm font-semibold">Dissolved oxygen, last readings</div>
                  <svg viewBox="0 0 560 120" preserveAspectRatio="none" className="h-28 w-full">
                    <defs>
                      <linearGradient id="ep-preview-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e7a46" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#1e7a46" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={`${PREVIEW_TREND} 560,120 0,120`}
                      fill="url(#ep-preview-fill)"
                    />
                    <polyline
                      points={PREVIEW_TREND}
                      fill="none"
                      stroke="#1e7a46"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--ep-tint)] p-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ep-ok)] text-white">
                    <Icon name="check" size={14} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{previewAlert.title}</div>
                    <div className="text-sm text-[var(--ep-text-muted)]">{previewAlert.detail}</div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[var(--ep-text-muted)]">
                    {previewAlert.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS: four stages, left to right */}
        <section
          id="process"
          aria-labelledby="process-title"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <div className="mb-10 max-w-[700px] sm:mb-14">
                <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">
                  The loop
                </div>
                <h2
                  id="process-title"
                  className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.1] tracking-tight"
                >
                  From sensor
                  <br className="hidden sm:block" />
                  to mangrove.
                </h2>
                <p className="mt-4 max-w-[36rem] text-lg leading-relaxed text-[var(--ep-text-muted)]">
                  Four stages run continuously, so the tank stays in range and
                  nothing it doesn&apos;t need goes to waste.
                </p>
              </div>
            </Reveal>

            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-[var(--ep-line)] lg:block"
              />
              <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {STEPS.map((s, i) => (
                  <li key={s.step}>
                    <Reveal delay={i * 110}>
                      <div className="group">
                        <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--ep-primary)] bg-[var(--ep-surface)] text-[var(--ep-accent)] transition-all duration-200 group-hover:-translate-y-1 group-hover:border-[var(--ep-accent)] group-hover:bg-[var(--ep-accent)] group-hover:text-white group-hover:shadow-[0_10px_24px_-12px_rgba(11,46,51,0.6)]">
                          <Icon
                            name={s.icon}
                            size={22}
                            className="transition-transform duration-200 group-hover:scale-110"
                          />
                        </div>
                        <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--ep-text-muted)] transition-colors duration-200 group-hover:text-[var(--ep-primary)]">
                          Step {s.step}
                        </div>
                        <h3 className="ep-font-display mb-2 text-xl font-semibold transition-colors duration-200 group-hover:text-[var(--ep-accent)]">
                          {s.title}
                        </h3>
                        <p className="text-base leading-relaxed text-[var(--ep-text-muted)]">
                          {s.body}
                        </p>
                      </div>
                    </Reveal>
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