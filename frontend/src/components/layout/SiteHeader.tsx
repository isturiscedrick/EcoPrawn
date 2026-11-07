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
  integrated = false,
}: SiteHeaderProps) {
  const isAuth = variant === "auth";
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  // The landing page is also rendered at /login (with the sign-in modal open).
  const onLanding = pathname === "/" || pathname === "/login";
  const navHref = pathname === "/login" ? "/" : pathname;
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
    setMobileNavOpen(false);
  }, [pathname]);

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

  // Every public page sits inside `.ep-landing`, so the header follows the landing tokens.
  const headerSurface = `color-mix(in srgb, var(--ep-bg) ${scrolled ? 94 : 82}%, transparent)`;
  const headerBorder = scrolled ? "var(--ep-line)" : "transparent";

  return (
    <>
    <header
      id="site-header"
      className="sticky top-0 z-50 border-b transition-all duration-300 backdrop-blur-2xl"
      style={{
        backgroundColor: headerSurface,
        borderColor: headerBorder,
        boxShadow: scrolled ? "0 10px 28px -24px rgba(0,0,0,.28)" : "none",
      }}
    >
      {/* Three columns (logo | nav | actions) so the nav is truly centered and can never overlap. */}
      <div
        className={`mx-auto min-h-[66px] max-w-[1440px] items-center gap-3 px-4 sm:gap-4 sm:px-8 lg:px-12 ${
          showLinks ? "grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]" : "flex justify-between"
        } ${isAuth ? "w-full" : ""}`}
      >
        {showLinks && (
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav-panel"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold lg:hidden ${focusRing}`}
            style={{ color: "var(--ep-primary)", borderColor: "var(--ep-line)", backgroundColor: "var(--ep-surface)" }}
          >
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {mobileNavOpen ? <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
            </svg>
            <span>{mobileNavOpen ? "Close" : "Menu"}</span>
          </button>
        )}

        <Link
          to="/"
          aria-label="EcoPrawn home"
          activeOptions={{ exact: true }}
          className={`flex shrink-0 items-center justify-self-start rounded-xl transition-transform duration-200 hover:scale-[1.025] active:scale-[.99] ${focusRing}`}
        >
          <BrandMark size={36} />
        </Link>

        {showLinks && (
          <div className="hidden justify-self-center lg:block">
            <NavLinks variant="desktop" activeHref={navHref} />
          </div>
        )}

        <div className="flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-3">
          {!isAuth && (
            <button
              type="button"
              onClick={toggleTheme}
              role="switch"
              aria-checked={darkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${focusRing}`}
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
              <span>{darkMode ? "Light" : "Dark"}</span>
            </button>
          )}

          {isAuth ? (
            <Link to="/" className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${focusRing}`} style={{ borderColor: "var(--ep-line)", color: "var(--ep-primary)" }}>
              <span aria-hidden="true">←</span> Back to home
            </Link>
          ) : (
            <>
              <AuthLink
                className={`hidden h-10 items-center rounded-full border px-5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 lg:inline-flex ${focusRing}`}
                style={{ borderColor: "var(--ep-line)", color: "var(--ep-primary)", backgroundColor: "var(--ep-surface)" }}
              >
                Log in
              </AuthLink>
              <AuthLink
                mode="signup"
                aria-label="Get started"
                className={`hidden h-10 min-w-10 items-center justify-center gap-2 rounded-full px-0 text-xs font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 lg:inline-flex lg:px-5 ${focusRing}`}
                style={{ backgroundColor: "var(--ep-accent)", color: "var(--ep-bg)" }}
              >
                <span className="hidden lg:inline">Get started</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
              </AuthLink>
            </>
          )}

        </div>
      </div>

    </header>

    {showLinks && (
      <>
        <button
          type="button"
          aria-label="Close navigation menu"
          tabIndex={mobileNavOpen ? 0 : -1}
          onClick={() => setMobileNavOpen(false)}
          className={`fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${mobileNavOpen ? "visible opacity-100" : "pointer-events-none invisible opacity-0"}`}
        />
        <aside
          id="mobile-nav-panel"
          aria-label="Mobile sidebar navigation"
          aria-hidden={!mobileNavOpen}
          inert={!mobileNavOpen}
          className={`fixed bottom-0 left-0 top-0 z-[70] flex w-[min(86vw,340px)] flex-col border-r shadow-2xl transition-transform duration-300 ease-out lg:hidden ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ backgroundColor: "var(--ep-bg)", borderColor: "var(--ep-line)", paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex min-h-[66px] items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--ep-line)" }}>
            <div className="flex items-center gap-3">
              <BrandMark size={30} />
              <span className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--ep-secondary)" }}>Menu</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${focusRing}`}
              style={{ color: "var(--ep-primary)", borderColor: "var(--ep-line)", backgroundColor: "var(--ep-surface)" }}
            >
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-3">
            <NavLinks variant="mobile" activeHref={navHref} onLinkClick={() => setMobileNavOpen(false)} />
          </div>
          <div className="flex flex-col gap-2 border-t p-5" style={{ borderColor: "var(--ep-line)", paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
            <AuthLink className="w-full rounded-full border px-4 py-3 text-center text-sm font-semibold transition-colors" style={{ borderColor: "var(--ep-line)", color: "var(--ep-primary)", backgroundColor: "var(--ep-surface)" }}>Log in</AuthLink>
            <AuthLink mode="signup" className="w-full rounded-full px-4 py-3 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5" style={{ backgroundColor: "var(--ep-accent)", color: "var(--ep-bg)" }}>Get started</AuthLink>
          </div>
        </aside>
      </>
    )}
    </>
  );
}
