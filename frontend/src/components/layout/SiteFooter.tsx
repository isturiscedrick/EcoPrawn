import { Link } from "@tanstack/react-router";
import { ScrollEnhancements } from "@/components/motion/ScrollUi";
import { AuthLink } from "@/features/auth/AuthModalProvider";
import { BrandMark } from "./BrandMark";

const linkClass =
  "inline-flex min-h-10 items-center rounded-md text-sm transition-colors duration-200 hover:text-[var(--ep-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

const headingClass =
  "text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ep-text-muted)]";

export function SiteFooter() {
  return (
    <>
      <footer
        data-site-footer
        className="relative isolate overflow-hidden border-t border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-9 sm:px-6 sm:py-11 lg:px-8 lg:py-14 xl:py-16"
      >
        <div className="ep-footer-inner mx-auto w-full max-w-[1280px]">
          <div className="ep-footer-grid grid grid-cols-2 gap-x-5 gap-y-8 border-b border-[var(--ep-line)] pb-8 sm:gap-x-8 sm:gap-y-9 sm:pb-9 lg:grid-cols-[1.45fr_0.72fr_0.95fr_0.88fr] lg:gap-12">
            <div className="ep-footer-brand col-span-2 min-w-0 border-0 bg-transparent p-0 shadow-none ring-0 lg:col-span-1">
              <Link
                to="/"
                resetScroll
                className="inline-flex rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]"
                aria-label="EcoPrawn home"
                activeOptions={{ exact: true }}
              >
                <BrandMark size={38} />
              </Link>
              <p className="mt-4 max-w-[25rem] text-sm leading-6 text-[var(--ep-text-muted)]">
                Connected water monitoring and farm insights for indoor shrimp operations.
              </p>
            </div>

            <div className="ep-footer-explore min-w-0 border-0 bg-transparent p-0 shadow-none ring-0">
              <h2 className={headingClass}>Explore</h2>
              <nav
                className="mt-3 flex flex-col items-start gap-1 text-[var(--ep-primary)]"
                aria-label="Footer navigation"
              >
                <Link className={linkClass} to="/" resetScroll activeOptions={{ exact: true }}>
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

            <div className="ep-footer-platform min-w-0 border-0 bg-transparent p-0 shadow-none ring-0">
              <h2 className={headingClass}>Platform</h2>
              <ul className="mt-3 flex flex-col gap-3 text-sm leading-5 text-[var(--ep-text-muted)]">
                <li>Water quality</li>
                <li>Feeding management</li>
                <li>Growth tracking</li>
                <li>Tank monitoring</li>
              </ul>
            </div>

            <div className="ep-footer-account min-w-0 border-0 bg-transparent p-0 shadow-none ring-0">
              <h2 className={headingClass}>Get started</h2>
              <p className="mt-3 max-w-[15rem] text-sm leading-6 text-[var(--ep-text-muted)]">
                Explore the tools for a clearer view of your farm.
              </p>
              <nav
                className="mt-2 flex flex-col items-start gap-0 text-[var(--ep-primary)]"
                aria-label="Account"
              >
                <AuthLink className={linkClass}>Sign in</AuthLink>
                <AuthLink mode="signup" className={linkClass}>
                  Create account
                </AuthLink>
              </nav>
            </div>
          </div>

          <div className="ep-footer-bottom flex flex-col gap-2 pt-5 text-xs leading-5 text-[var(--ep-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:pt-6">
            <p>
              University of Caloocan City · Computer Studies Department · CS 118
            </p>
            <p>© {new Date().getFullYear()} EcoPrawn. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ScrollEnhancements />
    </>
  );
}
