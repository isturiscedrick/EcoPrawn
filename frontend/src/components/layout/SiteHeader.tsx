import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";
import { AuthLink } from "@/features/auth/AuthModalProvider";
import { Icon } from "@/components/ui/Icon";

interface SiteHeaderProps {
  showLinks?: boolean;
  variant?: "default" | "auth";
  tone?: "cream" | "white";
  integrated?: boolean;
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

function ThemeIcon({ dark }: { dark: boolean }) {
  // Show the current theme: sun in light mode, moon in dark mode.
  return dark ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block", transform: "none", rotate: "0deg", transformOrigin: "center" }}>
      <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </svg>
  );
}

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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ep-dashboard-theme") === "dark";
  });

  // Explicit closes (backdrop, X, swipe, Escape) hand focus back to the menu button.
  const closeDrawer = useCallback(() => {
    setMobileNavOpen(false);
    menuButtonRef.current?.focus({ preventScroll: true });
  }, []);

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
    // Read the applied root class as the source of truth so this stays in sync
    // with theme changes made by other public/dashboard components.
    const root = document.documentElement;
    const next = !root.classList.contains("dark");

    setDarkMode(next);
    window.localStorage.setItem("ep-dashboard-theme", next ? "dark" : "light");
    root.classList.add("theme-transitioning");
    root.classList.toggle("dark", next);
    window.dispatchEvent(new Event("ecoprawn-theme-change"));

    window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 480);
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

  // Run the scroll lock before paint so closing the drawer never briefly
  // renders the document at scrollY=0 before restoring its previous position.
  // useLayoutEffect also restores the body styles and scroll offset atomically.
  useLayoutEffect(() => {
    if (!mobileNavOpen) return;

    // Lock both the document and body. Fixed-body locking also prevents
    // background scrolling on iOS Safari, where overflow:hidden alone can fail.
    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlScrollBehavior = html.style.scrollBehavior;
    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    closeButtonRef.current?.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileNavOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onChange);

      // Restore every inline style and return to the exact previous page offset.
      html.style.overflow = previousHtmlOverflow;
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      body.style.width = previousBodyStyles.width;
      body.style.overflow = previousBodyStyles.overflow;
      // Global smooth-scroll styles can animate this restoration from the top.
      // Temporarily disable smooth behavior so the saved offset is restored in one frame.
      html.style.scrollBehavior = "auto";
      window.scrollTo({ left: 0, top: scrollY, behavior: "instant" });
      html.style.scrollBehavior = previousHtmlScrollBehavior;
    };
  }, [mobileNavOpen, closeDrawer]);

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
            showLinks ? "grid grid-cols-[1fr_auto_1fr] lg:grid-cols-[1fr_auto_1fr]" : "flex justify-between"
          } ${isAuth ? "w-full" : ""}`}
        >
          {showLinks && (
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label="Open menu"
              className={`flex h-10 w-10 items-center justify-center justify-self-start rounded-none border-0 bg-transparent shadow-none transition-colors hover:bg-transparent focus-visible:bg-transparent lg:hidden ${focusRing}`}
              style={{ color: "var(--ep-primary)", backgroundColor: "transparent" }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                style={{ display: "block", transform: "none", rotate: "0deg", transformOrigin: "center" }}
              >
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <Link
            to="/"
            resetScroll
            aria-label="EcoPrawn home"
            activeOptions={{ exact: true }}
            className={`flex shrink-0 items-center justify-self-center rounded-xl transition-transform duration-200 hover:scale-[1.025] active:scale-[.99] ${focusRing} ${showLinks ? "lg:justify-self-start" : ""}`}
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
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${focusRing}`}
                style={{
                  color: "var(--ep-primary)",
                  borderColor: "var(--ep-line)",
                  backgroundColor: "var(--ep-surface)",
                }}
              >
                <ThemeIcon dark={darkMode} />
              </button>
            )}

            {isAuth ? (
              <Link to="/" className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${focusRing}`} style={{ borderColor: "var(--ep-line)", color: "var(--ep-primary)" }}>
                <span aria-hidden="true">←</span> Back to home
              </Link>
            ) : (
              <>
                <AuthLink
                  aria-label="Log in"
                  title="Log in"
                  className={`ep-cta-control ep-cta-secondary hidden h-10 w-10 items-center justify-center whitespace-nowrap rounded-full border text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 lg:inline-flex xl:w-auto xl:px-5 ${focusRing}`}
                  style={{ borderColor: "var(--ep-line)", color: "var(--ep-primary)", backgroundColor: "var(--ep-surface)" }}
                >
                  <svg className="xl:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="hidden xl:inline">Log in</span>
                </AuthLink>
                <AuthLink
                  mode="signup"
                  aria-label="Get started"
                  title="Get started"
                  className={`ep-cta-control ep-cta-primary hidden h-10 w-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-0 text-xs font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 lg:inline-flex xl:w-auto xl:px-5 ${focusRing}`}
                  style={{ backgroundColor: "var(--ep-accent)", color: "var(--ep-bg)" }}
                >
                  <span className="hidden whitespace-nowrap xl:inline">Get started</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
                </AuthLink>
              </>
            )}


          </div>
        </div>
      </header>

      {/* MOBILE DRAWER: a sibling of the header (not a child), because the header's
          backdrop-blur would otherwise trap this fixed layer inside the header box. */}
      {showLinks && (
        <div className="lg:hidden">
          <div
            aria-hidden="true"
            onClick={closeDrawer}
            className={`fixed inset-0 z-[80] bg-[rgba(8,30,34,0.55)] backdrop-blur-sm transition-opacity duration-300 dark:bg-[rgba(0,0,0,0.72)] ${
              mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            inert={!mobileNavOpen}
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0].clientX;
            }}
            onTouchEnd={(event) => {
              const start = touchStartX.current;
              touchStartX.current = null;
              if (start !== null && event.changedTouches[0].clientX - start < -60) closeDrawer();
            }}
            className={`ep-mobile-site-drawer fixed inset-y-0 left-0 z-[90] flex w-[min(94vw,400px)] flex-col overflow-hidden rounded-r-[1.4rem] border-r border-[var(--ep-line)] bg-[var(--ep-bg)] text-[var(--ep-text)] shadow-[12px_0_44px_-18px_rgba(8,30,34,0.38)] transition-transform duration-300 ease-out ${
              mobileNavOpen
                ? "translate-x-0 shadow-[8px_0_40px_-12px_rgba(8,30,34,0.45)]"
                : "-translate-x-full shadow-none"
            }`}
          >
            {/* Drawer header */}
            <div className="relative flex shrink-0 items-center justify-between border-b border-[var(--ep-line)] px-5 py-4">
              <div className="flex min-w-0 flex-col gap-1">
                <BrandMark size={32} logoColor="#1d4ed8" logoTextColor="var(--ep-secondary)" />
                <span className="ep-mobile-drawer-caption pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ep-text-muted)]">Explore EcoPrawn</span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)] shadow-sm transition-all duration-200 hover:rotate-90 hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)] ${focusRing}`}
              >
                <Icon name="x" size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Navigation */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
              <div className="px-6 pb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ep-text-muted)]">
                Navigation
              </div>
              <NavLinks variant="mobile" activeHref={navHref} onLinkClick={() => setMobileNavOpen(false)} />
            </div>

            {/* Account + theme */}
            <div className="flex shrink-0 flex-col gap-2.5 border-t border-[var(--ep-line)] bg-[var(--ep-surface)]/70 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <AuthLink
                mode="signup"
                onClick={() => setMobileNavOpen(false)}
                className={`ep-cta-control ep-cta-primary flex min-h-12 w-full items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-semibold ${focusRing}`}
                style={{ backgroundColor: "var(--ep-accent)", color: "var(--ep-on-accent, #ffffff)" }}
              >
                Get started
              </AuthLink>
              <AuthLink
                onClick={() => setMobileNavOpen(false)}
                className={`ep-cta-control ep-cta-secondary flex min-h-12 w-full items-center justify-center rounded-xl border px-4 py-3 text-center text-sm font-semibold ${focusRing}`}
                style={{ borderColor: "var(--ep-line)", color: "var(--ep-primary)", backgroundColor: "var(--ep-surface)" }}
              >
                Log in
              </AuthLink>

            </div>
          </div>
        </div>
      )}
    </>
  );
}