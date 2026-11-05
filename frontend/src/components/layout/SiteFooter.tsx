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
        className="relative isolate overflow-hidden border-t border-[var(--ep-line)] px-5 py-14 sm:px-8 sm:py-16"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 border-b border-[var(--ep-line)] pb-10 md:grid-cols-[1.6fr_0.8fr_1fr] md:gap-16">
            <div>
              <Link
                to="/"
                className="inline-flex rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]"
                aria-label="EcoPrawn home"
                activeOptions={{ exact: true }}
              >
                <BrandMark size={42} />
              </Link>
              <p className="mt-5 max-w-[27rem] text-base leading-relaxed text-[var(--ep-text-muted)]">
                An AIoT-enabled indoor white shrimp farming and water management
                system for healthier tanks and smarter operations.
              </p>
            </div>

            <div>
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

            <div>
              <h2 className={headingClass}>Built for better water</h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--ep-text-muted)]">
                Monitor quality, feeding, growth, and environmental return from
                one place.
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

          <div className="flex flex-col gap-3 pt-6 text-sm text-[var(--ep-text-muted)] sm:flex-row sm:items-center sm:justify-between">
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