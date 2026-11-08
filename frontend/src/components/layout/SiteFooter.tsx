import { Link } from "@tanstack/react-router";
import { ScrollEnhancements } from "@/components/motion/ScrollUi";
import { AuthLink } from "@/features/auth/AuthModalProvider";
import { BrandMark } from "./BrandMark";

const linkClass =
  "inline-flex min-h-9 items-center rounded-md text-base transition-colors hover:text-[var(--ep-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

const headingClass =
  "text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]";

export function SiteFooter() {
  return (
    <>
      <footer
        data-site-footer
        className="relative isolate overflow-hidden border-t border-[var(--ep-line)] bg-[var(--ep-surface)] px-5 py-10 sm:px-8 sm:py-14 lg:py-16"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-b border-[var(--ep-line)] pb-8 sm:gap-x-10 sm:gap-y-10 sm:pb-10 md:grid-cols-[1.5fr_0.75fr_1fr] md:gap-14">
            <div className="col-span-2 min-w-0 md:col-span-1">
              <Link
                to="/"
                className="inline-flex rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]"
                aria-label="EcoPrawn home"
                activeOptions={{ exact: true }}
              >
                <BrandMark size={42} />
              </Link>
              <p className="mt-3 max-w-[27rem] text-sm leading-6 text-[var(--ep-text-muted)] sm:mt-4 sm:text-base">
                An AIoT-enabled platform for indoor shrimp farming, water monitoring, and smarter farm operations.
              </p>
            </div>

            <div className="min-w-0">
              <h2 className={headingClass}>Explore</h2>
              <nav
                className="mt-4 flex flex-col items-start gap-1 text-[var(--ep-primary)]"
                aria-label="Footer navigation"
              >
                <Link className={linkClass} to="/" activeOptions={{ exact: true }}>
                  Home
                </Link>
                <Link className={linkClass} to="/about" activeOptions={{ exact: true }}>
                  About
                </Link>
                <Link className={linkClass} to="/contact" activeOptions={{ exact: true }}>
                  Contact
                </Link>
              </nav>
            </div>

            <div className="min-w-0">
              <h2 className={headingClass}>Built for better water</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--ep-text-muted)]">
                Monitor water quality, feeding, and growth in one place.
              </p>
              <nav
                className="mt-3 flex flex-col items-start gap-1 text-[var(--ep-primary)]"
                aria-label="Account"
              >
                <AuthLink className={linkClass}>Sign in</AuthLink>
                <AuthLink mode="signup" className={linkClass}>
                  Create account
                </AuthLink>
              </nav>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-5 text-xs leading-5 text-[var(--ep-text-muted)] sm:pt-6 sm:text-sm md:flex-row md:items-center md:justify-between">
            <p>
              University of Caloocan City · Computer Studies Department · CS 118
            </p>
            <p>© {new Date().getFullYear()} EcoPrawn</p>
          </div>
        </div>
      </footer>

      <ScrollEnhancements />
    </>
  );
}