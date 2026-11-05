import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";
import { AuthLink } from "@/features/auth/AuthModalProvider";

interface SiteHeaderProps {
  showLinks?: boolean;
  variant?: "default" | "auth";
  tone?: "cream" | "white";
  integrated?: boolean;
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

export function SiteHeader({
  showLinks = true,
  variant = "default",
  tone = "cream",
  integrated = false,
}: SiteHeaderProps) {
  const isAuth = variant === "auth";
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ep-dashboard-theme") === "dark";
  });

  useEffect(() => {
    const syncTheme = () => {
      const enabled = window.localStorage.getItem("ep-dashboard-theme") === "dark";
      setDarkMode(enabled);
      document.documentElement.classList.toggle("dark", enabled);
    };
    syncTheme();
    window.addEventListener("ecoprawn-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("ecoprawn-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, [pathname]);

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem("ep-dashboard-theme", next ? "dark" : "light");
      const root = document.documentElement;
      root.classList.add("theme-transitioning");
      window.setTimeout(() => root.classList.remove("theme-transitioning"), 480);
      root.classList.toggle("dark", next);
      window.dispatchEvent(new Event("ecoprawn-theme-change"));
      return next;
    });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const headerSurface = integrated
    ? darkMode ? "#202729" : "#F4F7F6"
    : darkMode
      ? scrolled ? "rgba(24,25,26,.94)" : "rgba(24,25,26,.78)"
      : tone === "white"
        ? scrolled ? "rgba(244,247,246,.96)" : "rgba(244,247,246,.84)"
        : scrolled ? "rgba(244,247,246,.96)" : "rgba(244,247,246,.84)";

  return (
    <header
      id="site-header"
      className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-2xl ${integrated ? "border-0" : "border-b"}`}
      style={{
        backgroundColor: headerSurface,
        borderColor: darkMode ? "rgba(139,213,166,.22)" : "rgba(15,76,92,.16)",
        boxShadow: scrolled ? (integrated ? "0 10px 28px -24px rgba(0,0,0,.28)" : "0 12px 34px -25px rgba(0,0,0,.35)") : "none",
      }}
    >
      <div className={`mx-auto flex min-h-[66px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12 ${isAuth ? "w-full" : ""}`}>
        <Link
          to="/"
          aria-label="EcoPrawn home"
          activeOptions={{ exact: true }}
          className={`flex shrink-0 items-center rounded-xl transition-transform duration-200 hover:scale-[1.025] active:scale-[.99] ${focusRing}`}
        >
          <BrandMark size={36} />
        </Link>

        {showLinks && <div className={integrated ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : ""}><NavLinks variant="desktop" activeHref={pathname} /></div>}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {!isAuth && (
            <button
              type="button"
              onClick={toggleTheme}
              role="switch"
              aria-checked={darkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${focusRing}`}
              style={{
                color: "var(--ep-primary)",
                borderColor: "var(--ep-line)",
                backgroundColor: "var(--ep-surface)",
              }}
            >
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />
                </svg>
              )}
            </button>
          )}

          {isAuth ? (
            <Link to="/" className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${focusRing}`} style={{ borderColor: "var(--ep-line)", color: "var(--ep-primary)" }}>
              <span aria-hidden="true">←</span> Back to home
            </Link>
          ) : (
            <>
              <AuthLink className={`hidden rounded-full border px-5 py-2 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 sm:inline-flex ${focusRing}`} style={{ borderColor: "var(--ep-line)", color: "var(--ep-primary)", backgroundColor: "var(--ep-surface)" }}>
                Log in
              </AuthLink>
              <AuthLink mode="signup" className={`hidden h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 sm:inline-flex ${focusRing}`} style={{ backgroundColor: "var(--ep-accent)" }}>
                <span aria-label="Get started">↗</span>
              </AuthLink>
            </>
          )}

          {showLinks && (
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              className={`flex h-10 w-10 items-center justify-center rounded-full border md:hidden ${focusRing}`}
              style={{ color: "var(--ep-primary)", borderColor: "var(--ep-line)", backgroundColor: "var(--ep-surface)" }}
            >
              <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                {mobileNavOpen ? <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
              </svg>
            </button>
          )}
        </div>
      </div>

      {showLinks && (
        <div className={`grid overflow-hidden transition-all duration-300 ease-out md:hidden ${mobileNavOpen ? "visible grid-rows-[1fr] opacity-100" : "invisible grid-rows-[0fr] opacity-0"}`}>
          <div className="min-h-0">
            <NavLinks variant="mobile" activeHref={pathname} onLinkClick={() => setMobileNavOpen(false)} />
            <div className="flex gap-3 px-5 pb-5 sm:hidden">
              <AuthLink className="flex-1 rounded-full border px-4 py-3 text-center text-sm font-semibold" style={{ borderColor: "var(--ep-line)", color: "var(--ep-primary)" }}>Log in</AuthLink>
              <AuthLink mode="signup" className="flex-1 rounded-full px-4 py-3 text-center text-sm font-semibold text-white" style={{ backgroundColor: "var(--ep-accent)" }}>Get started</AuthLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
