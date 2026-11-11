import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import { Icon } from "@/components/ui/Icon";
import { Sidebar } from "../components/Sidebar";

interface SystemLayoutProps {
  children: ReactNode;
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

export function SystemLayout({ children }: SystemLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const [darkMode, setDarkMode] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("ep-dashboard-theme") === "dark");

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

  const headerSurface = `color-mix(in srgb, var(--ep-bg) ${scrolled ? 94 : 82}%, transparent)`;
  const headerBorder = scrolled ? "var(--ep-line)" : "transparent";

  return (
    <div className="dashboard-shell min-h-screen bg-[var(--ep-bg)]">
      <header
        id="site-header"
        className="ep-landing sticky top-0 z-40 border-b transition-all duration-300 backdrop-blur-2xl"
        style={{
          backgroundColor: headerSurface,
          borderColor: headerBorder,
          boxShadow: scrolled ? "0 10px 28px -24px rgba(0,0,0,.28)" : "none",
        }}
      >
        <div className="mx-auto grid min-h-[66px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:gap-4 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open dashboard sidebar"
            aria-expanded={mobileSidebarOpen}
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
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={closeMobileSidebar} />

      {/* Responsive dashboard content area. */}
      <main className="mx-auto min-w-0 w-full max-w-[560px] px-3 pb-16 pt-3 sm:px-5 sm:pt-5 lg:max-w-[1440px] lg:ml-[260px] lg:w-[calc(100%-260px)]">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}