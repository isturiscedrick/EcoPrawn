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
  const [profileName, setProfileName] = useState("Facility Operator");
  const [profileRole, setProfileRole] = useState("FACILITY OPERATOR");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileInitials = profileName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "FO";

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
    const savedName = window.localStorage.getItem("ep-profile-name");
    const savedRole = window.localStorage.getItem("ep-profile-role");
    if (savedName) setProfileName(savedName);
    if (savedRole) setProfileRole(savedRole.toUpperCase());
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) setProfileMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileMenuOpen]);

  useEffect(() => setProfileMenuOpen(false), [pathname]);

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
        className={`ep-landing sticky top-0 z-40 border-b transition-all duration-300 lg:hidden ${scrolled ? "border-[var(--ep-line)] shadow-sm backdrop-blur-xl" : "border-transparent shadow-none backdrop-blur-none"}`}
        style={{
          backgroundColor: scrolled
            ? "color-mix(in srgb, var(--ep-surface) 92%, transparent)"
            : "var(--ep-bg)",
          borderColor: scrolled ? "var(--ep-line)" : "transparent",
          boxShadow: scrolled ? "0 8px 24px -22px rgba(15, 23, 42, .45)" : "none",
        }}
      >
        <div className="mx-auto flex min-h-[66px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <Link
            to="/dashboard"
            aria-label="EcoPrawn home"
            activeOptions={{ exact: true }}
            className={`flex min-w-0 shrink-0 items-center rounded-xl transition-transform duration-200 hover:scale-[1.025] active:scale-[.99] ${focusRing}`}
          >
            <BrandMark size={30} showWordmark />
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              role="switch"
              aria-checked={darkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${focusRing}`}
              style={{ color: "var(--ep-primary)", borderColor: "var(--ep-line)", backgroundColor: "var(--ep-surface)" }}
            >
              {darkMode ? <Icon name="moon" size={18} strokeWidth={1.8} /> : <Icon name="sun" size={18} strokeWidth={1.8} />}
            </button>
            <Link
              to="/dashboard/alerts"
              aria-label="Alerts"
              aria-current={pathname === "/dashboard/alerts" ? "page" : undefined}
              title="Alerts"
              className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${focusRing} ${pathname === "/dashboard/alerts" ? "text-[var(--ep-primary)]" : "text-[var(--ep-text-muted)]"}`}
              style={{ borderColor: "var(--ep-line)", backgroundColor: "var(--ep-surface)" }}
            >
              <Icon name="bell" size={18} strokeWidth={1.8} />
            </Link>
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--ep-line)] bg-[var(--ep-accent-tint)] text-xs font-bold text-[var(--ep-primary)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${focusRing}`}
              >
                {profileInitials}
              </button>
              {profileMenuOpen && (
                <div role="menu" aria-label="Profile menu" className="absolute right-0 top-[calc(100%+10px)] z-[100] w-60 overflow-hidden rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-2 text-[var(--ep-text)] shadow-[0_18px_48px_-18px_rgba(15,23,42,.38)]">
                  <div className="border-b border-[var(--ep-line)] px-3 py-2.5">
                    <p className="truncate text-sm font-semibold">{profileName}</p>
                    <p className="mt-0.5 truncate text-[11px] font-medium tracking-wide text-[var(--ep-text-muted)]">{profileRole}</p>
                  </div>
                  <Link to="/dashboard/profile" role="menuitem" onClick={() => setProfileMenuOpen(false)} className="mt-1 flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]">
                    <Icon name="user-round" size={17} />
                    View profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      setProfileMenuOpen(false);
                      if (!window.confirm("Are you sure you want to log out?")) return;
                      try {
                        const response = await fetch("/api/auth/logout", { method: "POST" });
                        if (!response.ok) throw new Error("Logout failed");
                        window.location.replace("/login");
                      } catch {
                        window.alert("Could not log out. Please try again.");
                      }
                    }}
                    className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-950/30"
                  >
                    <Icon name="log-out" size={17} />
                    Log out
                  </button>
                </div>
              )}
            </div>
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
          ["overview", "tanks", "vision", "feeding"].includes(item.view),
        ).map((item) => {
          const href = item.view === "overview" ? "/dashboard" : "/dashboard/" + item.view;
          const label = item.view === "overview" ? "Home" : item.view === "vision" ? "Vision" : item.label;
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