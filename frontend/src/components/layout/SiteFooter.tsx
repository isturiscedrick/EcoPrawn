import { Link } from "@tanstack/react-router";
import { ScrollEnhancements } from "@/components/motion/ScrollUi";
import { AuthLink } from "@/features/auth/AuthModalProvider";
import { BrandMark } from "./BrandMark";

const linkClass =
  "inline-flex min-h-8 items-center rounded-md text-sm transition-colors hover:text-[var(--ep-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

const headingClass =
  "text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]";

export function SiteFooter() {
  return (
    <>
      <footer
        data-site-footer
        className="relative isolate overflow-hidden border-t border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-12"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 border-b border-[var(--ep-line)] pb-6 sm:gap-x-8 sm:gap-y-8 sm:pb-8 md:grid-cols-[1.4fr_0.7fr_1fr] md:gap-10">
            <div className="col-span-2 min-w-0 md:col-span-1">
              <Link
                to="/"
                className="inline-flex rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]"
                aria-label="EcoPrawn home"
                activeOptions={{ exact: true }}
              >
                <BrandMark size={36} />
              </Link>
              <p className="mt-2 max-w-[24rem] text-xs leading-5 text-[var(--ep-text-muted)] sm:mt-3 sm:text-sm sm:leading-6">
                An AIoT-enabled platform for indoor shrimp farming, water monitoring, and smarter farm operations.
              </p>
            </div>

            <div className="min-w-0">
              <h2 className={headingClass}>Explore</h2>
              <nav
                className="mt-2 flex flex-col items-start gap-0 text-[var(--ep-primary)] sm:mt-3"
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
              <p className="mt-2 text-xs leading-5 text-[var(--ep-text-muted)] sm:text-sm sm:leading-6">
                Monitor water quality, feeding, and growth in one place.
              </p>
              <nav
                className="mt-2 flex flex-col items-start gap-0 text-[var(--ep-primary)] sm:mt-3"
                aria-label="Account"
              >
                <AuthLink className={linkClass}>Sign in</AuthLink>
                <AuthLink mode="signup" className={linkClass}>
                  Create account
                </AuthLink>
              </nav>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-4 text-[11px] leading-4 text-[var(--ep-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:pt-5 sm:text-xs sm:leading-5">
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