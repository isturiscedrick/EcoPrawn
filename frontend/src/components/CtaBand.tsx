import { Link } from "@tanstack/react-router";
import { AuthLink } from "@/features/auth/AuthModalProvider";

interface CtaBandProps {
  secondaryHref: string;
  secondaryLabel: string;
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-deep,#111827)]";

const motion =
  "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0";

export function CtaBand({ secondaryHref, secondaryLabel }: CtaBandProps) {
  return (
    <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:pb-24">
      <div
        data-band=""
        className="mx-auto flex max-w-[1200px] flex-col gap-8 rounded-3xl bg-[var(--ep-deep,#111827)] px-6 py-10 text-[var(--ep-on-deep,#f8fafc)] sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12"
      >
        <div className="min-w-0 lg:flex-1">
          <h2 className="ep-font-display max-w-[28rem] text-balance text-[clamp(28px,3.5vw,40px)] font-semibold leading-[1.1] tracking-tight">
            See your tanks, always in range.
          </h2>
          <p className="mt-3 max-w-[34rem] text-lg leading-relaxed text-[var(--ep-on-deep-muted,#cbd5e1)]">
            Sign in to monitor water quality, feeding, and shrimp growth from a
            single dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <AuthLink
            className={`group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--ep-on-deep,#f8fafc)] px-7 py-3.5 text-base font-semibold text-[var(--ep-deep,#111827)] hover:bg-white hover:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] ${motion} ${focusRing}`}
          >
            Sign in to dashboard
            <span
              aria-hidden="true"
              className="inline-flex items-center transition-transform duration-200 group-hover:translate-x-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </span>
          </AuthLink>

          <Link
            to={secondaryHref}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl border-2 border-white/60 px-7 py-3.5 text-base font-semibold text-[var(--ep-on-deep,#f8fafc)] hover:bg-white/10 ${motion} ${focusRing}`}
            activeOptions={{ exact: true }}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}