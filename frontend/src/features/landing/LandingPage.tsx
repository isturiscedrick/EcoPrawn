import Link from "next/link";
import { TankHeroSvg } from "@/features/dashboard/TankHeroSvg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CtaBand } from "@/components/CtaBand";
import { Icon, type IconName } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { AuthLink } from "@/features/auth/AuthModalProvider";
import { heroReadouts, heroReadoutUnits } from "@/data/ecoprawn";

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

export function LandingPage() {
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

        {/* READINGS: sand band with ink outlines, ink values */}
        <section
          aria-labelledby="readings-title"
          className="border-y-2 border-[var(--ep-primary)] bg-[var(--ep-tint)] text-[var(--ep-primary)]"
        >
          <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-12">
            <h2 id="readings-title" className="ep-font-display text-lg font-semibold">
              Tank 1 · latest readings
            </h2>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
              {heroReadouts.map((readout) => (
                <div key={readout.label} className="last:col-span-2 md:last:col-span-1">
                  <dt className="text-sm font-semibold uppercase tracking-wide">
                    {readout.label}
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tabular-nums">
                    {readout.value}
                    <span className="ml-1 text-base font-medium">
                      {heroReadoutUnits[readout.label]}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
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