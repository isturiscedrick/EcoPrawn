import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";
import { AuthLink } from "@/features/auth/AuthModalProvider";

interface SiteHeaderProps {
  showLinks?: boolean;
  /** "auth" = compact header for login pages (smaller logo, back link instead of Log in). */
  variant?: "default" | "auth";
  /** Header background: "cream" (default, matches the page) or "white". */
  tone?: "cream" | "white";
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

export function SiteHeader({
  showLinks = true,
  variant = "default",
  tone = "cream",
}: SiteHeaderProps) {
  const isAuth = variant === "auth";
  const isWhite = tone === "white";
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const enabled = window.localStorage.getItem("ep-dashboard-theme") === "dark";
    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem("ep-dashboard-theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  // Frosted background always; a darker border, shadow and gradient hairline appear once the page scrolls.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (mobileNavOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileNavOpen]);

  // Close mobile menu on Escape for keyboard users.
  useEffect(() => {
    if (!mobileNavOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const topBg = isWhite ? "bg-white" : "bg-[rgba(251,248,241,0.96)]";
  const scrolledBg = isWhite
    ? "bg-[rgba(255,255,255,0.92)]"
    : "bg-[rgba(251,248,241,0.92)]";

  return (
    <header
      id="site-header"
      className={`sticky top-0 z-50 relative border-b border-[rgba(11,46,51,0.12)] backdrop-blur-md transition-[background-color,box-shadow] duration-200 ${
        scrolled
          ? `${scrolledBg} shadow-[0_8px_24px_-14px_rgba(11,46,51,0.35)]`
          : topBg
      }`}
    >
      {/* With links: logo | centered nav | actions (true center, whatever the side widths).
          Without links: plain two-sided row. */}
      <div
        className={`flex h-[72px] items-center justify-between gap-3 md:h-20 ${
          showLinks ? "md:grid md:grid-cols-[1fr_auto_1fr]" : ""
        } ${
          isAuth
            ? "w-full px-5 sm:px-8 lg:px-12 xl:px-16"
            : "mx-auto max-w-310 px-5 sm:px-8 lg:px-10"
        }`}
      >
        <Link
          to="/"
          className={`flex shrink-0 items-center rounded-md transition-transform duration-200 hover:scale-[1.03] active:scale-100 md:justify-self-start ${focusRing}`}
          aria-label="EcoPrawn home"
          activeOptions={{ exact: true }}
        >
          <span className="md:hidden">
            <BrandMark size={isAuth ? 32 : 34} />
          </span>

          <span className="hidden md:block">
            <BrandMark size={isAuth ? 36 : 40} />
          </span>
        </Link>

        {showLinks && <NavLinks variant="desktop" activeHref={pathname} />}

        <div className="flex shrink-0 items-center gap-2 md:justify-self-end">
          {isAuth ? (
            <Link
              to="/"
              className={`group inline-flex items-center gap-2 rounded-lg border border-[rgba(11,46,51,0.22)] px-4 py-2 text-sm font-semibold text-[var(--ep-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] active:translate-y-0 sm:px-5 ${focusRing}`}
              activeOptions={{ exact: true }}
            >
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:-translate-x-1"
              >
                ←
              </span>
              Back to home
            </Link>
          ) : (
            <>
              <AuthLink
                className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(11,46,51,0.22)] bg-white/60 px-4 py-2.5 text-sm font-semibold text-[var(--ep-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] hover:shadow-[0_8px_18px_-10px_rgba(11,46,51,0.35)] active:translate-y-0 sm:px-5 ${focusRing}`}
              >
                <svg
                  className="shrink-0"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c.7-3.1 3.2-5 7-5s6.3 1.9 7 5" />
                </svg>
                Log in
              </AuthLink>

              <AuthLink
                mode="signup"
                className={`group hidden items-center justify-center gap-2 rounded-lg bg-[var(--ep-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_14px_-8px_rgba(178,63,28,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--ep-accent-hover)] hover:shadow-[0_10px_20px_-10px_rgba(178,63,28,0.55)] active:translate-y-0 sm:inline-flex sm:px-5 ${focusRing}`}
              >
                <svg
                  className="shrink-0"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Sign up
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </AuthLink>
            </>
          )}

          {showLinks && (
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              className={`relative flex h-11 w-11 items-center justify-center rounded-lg border-2 border-[var(--ep-primary)] text-[var(--ep-primary)] transition-colors duration-200 hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] md:hidden ${focusRing}`}
            >
              <span className="sr-only">Toggle navigation</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1.5 4H14.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className={`origin-center transition-all duration-200 ${
                    mobileNavOpen ? "translate-y-[3.5px] rotate-45" : ""
                  }`}
                />
                <path
                  d="M1.5 8H14.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className={`origin-center transition-opacity duration-150 ${
                    mobileNavOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <path
                  d="M1.5 12H14.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className={`origin-center transition-all duration-200 ${
                    mobileNavOpen ? "translate-y-[-3.5px] -rotate-45" : ""
                  }`}
                />
              </svg>
            </button>
          )}
        </div>
      </div>


      {!isAuth && (
        <div className="absolute right-0 top-full z-40 flex justify-end px-5 pt-2 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
            aria-pressed={darkMode}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(11,46,51,0.22)] bg-white/90 px-3 text-sm font-semibold text-[var(--ep-primary)] shadow-md backdrop-blur-sm transition-colors hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] ${focusRing}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {darkMode ? <circle cx="12" cy="12" r="4" /> : <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />}
            </svg>
            <span className="hidden sm:inline">{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      )}

      {showLinks && (
        <div
          className={`grid overflow-hidden transition-all duration-300 ease-out md:hidden ${
            mobileNavOpen
              ? "visible grid-rows-[1fr] opacity-100"
              : "invisible grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            <NavLinks
              variant="mobile"
              activeHref={pathname}
              onLinkClick={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
