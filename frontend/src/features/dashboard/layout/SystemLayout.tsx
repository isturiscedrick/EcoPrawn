import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import { Icon } from "@/components/ui/Icon";
import { Sidebar } from "../components/Sidebar";

interface SystemLayoutProps {
  children: ReactNode;
}

export function SystemLayout({ children }: SystemLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  const toggleTheme = () => {
    const next = !darkMode;
    window.localStorage.setItem("ep-dashboard-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.add("theme-transitioning");
    window.setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 480);
    setDarkMode(next);
    window.dispatchEvent(new Event("ecoprawn-theme-change"));
  };

  return (
    <div className="dashboard-shell min-h-screen bg-[var(--ep-bg)]">
      <div className={`grid grid-cols-1 transition-[grid-template-columns] duration-200 ease-out ${sidebarCollapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[260px_1fr]"}`}>
        {/* SIDEBAR */}
        <div className="relative z-50 lg:sticky lg:top-0 lg:h-screen">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((current) => !current)}
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        </div>

        {/* MAIN */}
        <main className="min-w-0 px-3 pb-16 pt-3 sm:px-5 sm:pt-5 md:px-8 lg:px-10 lg:pt-8">
          <div className="relative mb-5 flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 shadow-sm">
            <button type="button" onClick={() => { if (window.matchMedia("(min-width: 1024px)").matches) setSidebarCollapsed((current) => !current); else setMobileSidebarOpen(true); }} aria-label="Open dashboard sidebar" aria-expanded={mobileSidebarOpen} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--ep-line)] bg-[var(--ep-accent-tint)] text-[var(--ep-text)] shadow-sm transition-colors hover:bg-[var(--ep-line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]">
              <Icon name="menu" size={21} />
            </button>
            <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center justify-center">
              <BrandMark size={28} showWordmark />
            </div>
            <button type="button" onClick={toggleTheme} aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--ep-line)] text-[var(--ep-text)] transition-colors hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]">
              {darkMode ? <Icon name="sun" size={20} /> : <Icon name="moon" size={20} />}
            </button>
          </div>
          <div className="mx-auto max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}