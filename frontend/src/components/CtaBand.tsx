import Link from "next/link";
import { AuthLink } from "@/features/auth/AuthModalProvider";

interface CtaBandProps {
  secondaryHref: string;
  secondaryLabel: string;
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-bg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-primary)]";

const motion =
  "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0";

export function CtaBand({ secondaryHref, secondaryLabel }: CtaBandProps) {
  return (
    <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:pb-24">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 rounded-3xl border-2 border-[var(--ep-primary)] bg-[var(--ep-primary)] px-6 py-10 text-[var(--ep-bg)] sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="min-w-0 lg:flex-1">
          <h2 className="ep-font-display max-w-[28rem] text-balance text-[clamp(28px,3.5vw,40px)] font-semibold leading-[1.1] tracking-tight">
            See your tanks, always in range.
          </h2>
          <p className="mt-3 max-w-[34rem] text-lg leading-relaxed text-[var(--ep-tint)]">
            Sign in to monitor water quality, feeding, and shrimp growth from a
            single dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <AuthLink
            className={`group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-[var(--ep-bg)] bg-[var(--ep-bg)] px-7 py-3.5 text-base font-semibold text-[var(--ep-primary)] hover:bg-white hover:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] ${motion} ${focusRing}`}
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
            href={secondaryHref}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl border-2 border-[var(--ep-bg)] px-7 py-3.5 text-base font-semibold text-[var(--ep-bg)] hover:bg-[var(--ep-bg)] hover:text-[var(--ep-primary)] ${motion} ${focusRing}`}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}