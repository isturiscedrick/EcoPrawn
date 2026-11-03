import { Link } from "@tanstack/react-router";
import { ScrollEnhancements } from "@/components/motion/ScrollUi";
import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  return (
    <>
      <footer
        data-site-footer
        className="relative isolate overflow-hidden px-5 py-14 sm:px-8 sm:py-16"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 border-b border-[rgba(255,255,255,0.2)] pb-10 md:grid-cols-[1.6fr_0.8fr_1fr] md:gap-16">
            <div>
              <Link
                to="/"
                className="inline-flex rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-bg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-primary)]"
                aria-label="EcoPrawn home"
                activeOptions={{ exact: true }}
              >
                <BrandMark size={42} />
              </Link>
              <p className="mt-5 max-w-[27rem] text-base leading-relaxed text-[rgba(255,255,255,0.78)]">
                An AIoT-enabled indoor white shrimp farming and water management
                system for healthier tanks and smarter operations.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[rgba(255,255,255,0.62)]">
                Explore
              </h2>
              <nav
                className="mt-4 flex flex-col items-start gap-3 text-base"
                aria-label="Footer navigation"
              >
                <Link
                  className="transition-colors hover:text-[var(--ep-accent)]"
                  to="/"
                  activeOptions={{ exact: true }}
                >
                  Home
                </Link>
                <Link
                  className="transition-colors hover:text-[var(--ep-accent)]"
                  to="/about"
                  activeOptions={{ exact: true }}
                >
                  About
                </Link>
                <Link
                  className="transition-colors hover:text-[var(--ep-accent)]"
                  to="/contact"
                  activeOptions={{ exact: true }}
                >
                  Contact
                </Link>
              </nav>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[rgba(255,255,255,0.62)]">
                Built for better water
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[rgba(255,255,255,0.78)]">
                Monitor quality, feeding, growth, and environmental return from
                one place.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 text-sm text-[rgba(255,255,255,0.62)] sm:flex-row sm:items-center sm:justify-between">
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
