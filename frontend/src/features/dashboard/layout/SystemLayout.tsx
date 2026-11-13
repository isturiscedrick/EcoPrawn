import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useRouterState } from "@tanstack/react-router";
import { MOTION_ALLOWED_QUERY } from "@/components/motion/motionRuntime";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import { Icon } from "@/components/ui/Icon";
import { Sidebar } from "../components/Sidebar";
import { DASHBOARD_NAV_ITEMS } from "@/config/nav";

interface SystemLayoutProps {
  children: ReactNode;
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

export function SystemLayout({ children }: SystemLayoutProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const wasMobileSidebarOpen = useRef(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  useEffect(() => {
    if (mobileSidebarOpen) {
      wasMobileSidebarOpen.current = true;
      return;
    }
    if (wasMobileSidebarOpen.current) {
      mobileMenuButtonRef.current?.focus({ preventScroll: true });
      wasMobileSidebarOpen.current = false;
    }
  }, [mobileSidebarOpen]);
  const [darkMode, setDarkMode] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("ep-dashboard-theme") === "dark");

  useLayoutEffect(() => {
    const main = document.querySelector<HTMLElement>("[data-dashboard-route-content]");
    if (!main) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_ALLOWED_QUERY, () => {
      const ctx = gsap.context(() => {
        const content = Array.from(main.children) as HTMLElement[];
        if (content.length) gsap.fromTo(
          content,
          { y: 12, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.42,
            stagger: 0.045,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
            overwrite: "auto",
          }
        );
      }, main);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, [pathname]);

  useEffect(() => {
    const syncTheme = () => setDarkMode(window.localStorage.getItem("ep-dashboard-theme") === "dark");
    window.addEventListener("ecoprawn-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("ecoprawn-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    window.localStorage.setItem("ep-dashboard-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.add("theme-transitioning");
    window.setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 480);
    setDarkMode(next);
    window.dispatchEvent(new Event("ecoprawn-theme-change"));
  };

  // Keep the mobile dashboard chrome visually light; only its controls float above content.

  return (
    <div className="dashboard-shell min-h-screen bg-[var(--ep-bg)]">
      <header
        id="site-header"
        className="ep-landing sticky top-0 z-40 border-b border-transparent bg-transparent shadow-none transition-all duration-300 backdrop-blur-none lg:hidden"
        style={{
          backgroundColor: "transparent",
          borderColor: "transparent",
          boxShadow: "none",
        }}
      >
        <div className="mx-auto grid min-h-[66px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:gap-4 sm:px-8 lg:px-12">
          <div aria-hidden="true" className="h-10 w-10 justify-self-start" />

          <Link
            to="/dashboard"
            aria-label="EcoPrawn home"
            activeOptions={{ exact: true }}
            className={`flex shrink-0 items-center justify-self-center rounded-xl transition-transform duration-200 hover:scale-[1.025] active:scale-[.99] ${focusRing}`}
          >
            <BrandMark size={36} />
          </Link>

          <div className="flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-3">
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
              {darkMode ? <Icon name="moon" size={18} strokeWidth={1.8} /> : <Icon name="sun" size={18} strokeWidth={1.8} />}
            </button>
          </div>
        </div>
      </header>

      {/* Persistent desktop navigation and mobile drawer. */}
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={closeMobileSidebar} darkMode={darkMode} onToggleTheme={toggleTheme} />

      {/* Responsive dashboard content area. */}
      <main data-dashboard-route-content="" className="mx-auto min-w-0 w-full max-w-[560px] px-3 pb-24 pt-3 sm:px-5 sm:pt-5 lg:pb-16 lg:mx-0 lg:ml-[260px] lg:w-[calc(100%-260px)] lg:max-w-none">
        <div className="w-full">{children}</div>
      </main>

      {/* Thumb-friendly dashboard navigation for phones and tablets. The More
          action reuses the existing accessible sidebar drawer for all modules. */}
      <nav
        aria-label="Quick dashboard navigation"
        className="fixed inset-x-0 bottom-0 z-[70] grid grid-cols-5 border-t border-[var(--ep-line)] bg-[color-mix(in_srgb,var(--ep-surface)_94%,transparent)] px-1 pt-2 pb-[max(.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-24px_rgba(15,23,42,.42)] backdrop-blur-xl lg:hidden"
      >
        {DASHBOARD_NAV_ITEMS.filter((item) =>
          ["overview", "tanks", "water", "alerts"].includes(item.view),
        ).map((item) => {
          const href = item.view === "overview" ? "/dashboard" : "/dashboard/" + item.view;
          const label = item.view === "overview" ? "Home" : item.view === "water" ? "Water" : item.label;
          const active = item.view === "overview"
            ? pathname === "/dashboard" || pathname === "/dashboard/overview"
            : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={item.view}
              to={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              activeOptions={{ exact: true }}
              className={"flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] " + (active ? "text-[var(--ep-primary)]" : "text-[var(--ep-text-muted)] hover:text-[var(--ep-text)]")}
            >
              <span className={"flex h-7 w-9 items-center justify-center rounded-xl transition-colors " + (active ? "bg-[var(--ep-accent-tint)]" : "bg-transparent")}>
                <Icon name={item.icon} size={19} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
        <button
          ref={mobileMenuButtonRef}
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="More dashboard sections"
          aria-haspopup="dialog"
          aria-controls="dashboard-mobile-drawer"
          aria-expanded={mobileSidebarOpen}
          className={"flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] " + (mobileSidebarOpen ? "text-[var(--ep-primary)]" : "text-[var(--ep-text-muted)] hover:text-[var(--ep-text)]")}
        >
          <span className={"flex h-7 w-9 items-center justify-center rounded-xl " + (mobileSidebarOpen ? "bg-[var(--ep-accent-tint)]" : "bg-transparent")}>
            <Icon name="menu" size={19} strokeWidth={1.8} />
          </span>
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}