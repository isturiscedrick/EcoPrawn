import Link from "next/link";
import { TankHeroSvg } from "@/features/dashboard/TankHeroSvg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { heroReadouts, heroReadoutUnits } from "@/data/ecoprawn";

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--ep-bg)] text-[var(--ep-primary)]">
      <SiteHeader />

      <main>
        {/* HERO: cream background (60%), coral accent on one phrase and one button (10%) */}
        <section
          id="top"
          className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 md:gap-12 lg:py-20"
        >
          <div>
            <h1 className="ep-font-display text-[clamp(40px,5.5vw,64px)] font-semibold leading-[1.1] tracking-tight">
              Indoor shrimp farming,{" "}
              <span className="text-[var(--ep-accent)]">always in range.</span>
            </h1>

            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-[var(--ep-text-muted)]">
              Live water quality, automated feeding, and AI growth tracking for
              your tanks, all in one dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className={`inline-flex items-center justify-center rounded-xl border-2 border-[var(--ep-accent)] bg-[var(--ep-accent)] px-7 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:border-[var(--ep-primary)] hover:bg-[var(--ep-primary)] ${focusRing}`}
              >
                Sign in to dashboard
              </Link>

              <Link
                href="/about"
                className={`inline-flex items-center justify-center rounded-xl border-2 border-[var(--ep-primary)] px-7 py-3.5 text-base font-semibold text-[var(--ep-primary)] transition-colors duration-200 hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] ${focusRing}`}
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Tank visual: ink panel (30%) */}
          <div
            aria-hidden="true"
            className="mx-auto flex h-[340px] w-full max-w-[460px] items-center justify-center rounded-3xl border-2 border-[var(--ep-primary)] bg-[var(--ep-primary)] p-4 sm:h-[420px] md:h-[460px] [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full"
          >
            <TankHeroSvg />
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
      </main>

      <SiteFooter />
    </div>
  );
}