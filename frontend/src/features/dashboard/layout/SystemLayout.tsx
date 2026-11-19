import "@/styles/dashboard.css";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { Link, useRouterState } from "@tanstack/react-router";
import { MOTION_ALLOWED_QUERY } from "@/components/motion/motionPolicy";
import { BrandMark } from "@/components/layout/BrandMark";
import { Icon } from "@/components/ui/Icon";
import { Sidebar } from "../components/Sidebar";
import { DASHBOARD_NAV_ITEMS } from "@/config/nav";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { deriveTankAlerts } from "@/features/dashboard/lib/alerts";
import { DASHBOARD_QUICK_LINKS } from "./system-layout-utils";
import { DashboardCommandSearch } from "./DashboardCommandSearch";
import { DashboardProfileMenu } from "./DashboardProfileMenu";
import { DashboardLogoutDialogs } from "./DashboardLogoutDialogs";

interface SystemLayoutProps {
  children: ReactNode;
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

export function SystemLayout({ children }: SystemLayoutProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { tanks, isDbConnected, lastUpdatedAt, loading, refreshTanks, isRefreshing } = useTanks();
  const activeAlertCount = deriveTankAlerts(tanks).length;
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  useEffect(() => {
    try {
      setDesktopSidebarCollapsed(window.localStorage.getItem("ep-sidebar-collapsed") === "true");
    } catch {
      // Keep the expanded sidebar when browser storage is unavailable.
    }
  }, []);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutErrorOpen, setLogoutErrorOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchDialogRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchReturnFocusRef = useRef<HTMLElement | null>(null);
  const openSearch = useCallback(() => {
    searchReturnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback((restoreFocus = true) => {
    if (!restoreFocus) searchReturnFocusRef.current = null;
    setSearchOpen(false);
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [profileName, setProfileName] = useState("Facility Operator");
  const [profileRole, setProfileRole] = useState("FACILITY OPERATOR");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const pullStartY = useRef<number | null>(null);

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
    const savedImage = window.localStorage.getItem("ep-profile-image");
    if (savedName) setProfileName(savedName);
    if (savedRole) setProfileRole(savedRole.toUpperCase());
    setProfileImage(savedImage);
    const syncProfile = () => {
      setProfileName(window.localStorage.getItem("ep-profile-name") ?? "Facility Operator");
      setProfileRole((window.localStorage.getItem("ep-profile-role") ?? "FACILITY OPERATOR").toUpperCase());
      setProfileImage(window.localStorage.getItem("ep-profile-image"));
    };
    window.addEventListener("ecoprawn:profile-updated", syncProfile);
    window.addEventListener("storage", syncProfile);
    return () => {
      window.removeEventListener("ecoprawn:profile-updated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [openSearch]);

  useEffect(() => {
    if (!searchOpen) {
      const previous = searchReturnFocusRef.current;
      searchReturnFocusRef.current = null;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    searchInputRef.current?.focus({ preventScroll: true });

    const onDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        searchDialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");
      if (!focusable.length) {
        event.preventDefault();
        searchDialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !searchDialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !searchDialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onDialogKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onDialogKeyDown);
    };
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchingPages = DASHBOARD_NAV_ITEMS.filter((item) =>
    !normalizedSearch ||
    item.label.toLowerCase().includes(normalizedSearch) ||
    item.view.includes(normalizedSearch) ||
    (item.description && item.description.toLowerCase().includes(normalizedSearch)) ||
    (item.badge && item.badge.toLowerCase().includes(normalizedSearch)),
  );
  const matchingTanks = tanks.filter((tank) =>
    normalizedSearch && `${tank.name} ${tank.pl}`.toLowerCase().includes(normalizedSearch),
  );

  // Keep the mobile dashboard chrome visually light; only its controls float above content.

  return (
    <div className="dashboard-shell min-h-screen bg-[var(--ep-bg)]" style={{ "--dashboard-sidebar-width": desktopSidebarCollapsed ? "88px" : "260px" } as React.CSSProperties}>
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
        <div className="mx-auto flex min-h-[64px] max-w-[1440px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-8 lg:px-12">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open dashboard navigation"
              aria-controls="dashboard-mobile-drawer"
              aria-expanded={mobileNavOpen}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-primary)] shadow-sm transition-colors hover:bg-[var(--ep-tint)] ${focusRing}`}
            >
              <Icon name="menu" size={19} strokeWidth={2} />
            </button>
            <Link
              to="/dashboard"
              aria-label="EcoPrawn home"
              activeOptions={{ exact: true }}
              className={`flex min-w-0 shrink-0 items-center rounded-xl transition-transform duration-200 hover:scale-[1.025] active:scale-[.99] ${focusRing}`}
            >
              <BrandMark size={28} showWordmark />
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/dashboard/alerts"
              aria-label={activeAlertCount > 0 ? `Alerts, ${activeAlertCount} active` : "Alerts"}
              aria-current={pathname === "/dashboard/alerts" ? "page" : undefined}
              title="Alerts"
              className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${focusRing} ${pathname === "/dashboard/alerts" ? "border-[var(--ep-accent)] bg-[var(--ep-accent-tint)] text-[var(--ep-accent)]" : "border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)] hover:bg-[var(--ep-tint)] hover:text-[var(--ep-text)]"}`}
            >
              <Icon name="bell-ring" size={18} strokeWidth={1.8} />
              {activeAlertCount > 0 && (
                <span aria-hidden="true" className="absolute -right-1 -top-1 inline-flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[var(--ep-bg)] bg-[var(--ep-status-danger)] px-1 text-[9px] font-bold leading-none text-white">
                  {activeAlertCount > 9 ? "9+" : activeAlertCount}
                </span>
              )}
            </Link>
            <DashboardProfileMenu
              pathname={pathname}
              profileName={profileName}
              profileRole={profileRole}
              profileImage={profileImage}
              onRequestLogout={() => setLogoutConfirmOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* Persistent desktop navigation and mobile drawer. */}
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={closeMobileNav}
        collapsed={desktopSidebarCollapsed}
        alertCount={activeAlertCount}
        tankCount={tanks.length}
        isDbConnected={isDbConnected}
        profileImage={profileImage}
        onToggleCollapsed={() => setDesktopSidebarCollapsed((collapsed) => { const next = !collapsed; try { window.localStorage.setItem("ep-sidebar-collapsed", String(next)); } catch { /* Keep the in-memory preference for this session. */ } return next; })}
      />

      <DashboardCommandSearch
        open={searchOpen}
        query={searchQuery}
        pages={matchingPages}
        tanks={matchingTanks}
        inputRef={searchInputRef}
        dialogRef={searchDialogRef}
        onQueryChange={setSearchQuery}
        onClose={closeSearch}
      />

      <DashboardLogoutDialogs
        confirmOpen={logoutConfirmOpen}
        errorOpen={logoutErrorOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={async () => {
          setLogoutConfirmOpen(false);
          try {
            const response = await fetch("/api/auth/logout", { method: "POST" });
            if (!response.ok) throw new Error("Logout failed");
            window.location.replace("/login");
          } catch {
            setLogoutErrorOpen(true);
          }
        }}
        onErrorDismiss={() => setLogoutErrorOpen(false)}
      />

      {/* Responsive dashboard content area. */}
      <main
        data-dashboard-route-content=""
        onTouchStart={(event) => {
          const scrollTop = document.scrollingElement?.scrollTop ?? window.scrollY;
          if (
            window.matchMedia("(min-width: 1024px)").matches ||
            scrollTop > 0 ||
            event.touches.length !== 1 ||
            isRefreshing
          ) {
            pullStartY.current = null;
            return;
          }
          pullStartY.current = event.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(event) => {
          const startY = pullStartY.current;
          pullStartY.current = null;
          const endY = event.changedTouches[0]?.clientY;
          const scrollTop = document.scrollingElement?.scrollTop ?? window.scrollY;
          if (
            startY !== null &&
            endY !== undefined &&
            endY - startY >= 80 &&
            scrollTop <= 0 &&
            !isRefreshing
          ) {
            void refreshTanks();
          }
        }}
        onTouchCancel={() => {
          pullStartY.current = null;
        }}
        className="mx-auto min-w-0 w-full max-w-[560px] px-3 pb-24 pt-3 sm:max-w-[720px] sm:px-5 sm:pt-5 md:max-w-[900px] lg:pb-16 lg:mx-0 lg:max-w-none lg:transition-[margin,width] lg:duration-300 lg:ease-in-out motion-reduce:lg:transition-none"
      >
        <div className="w-full min-w-0">
          {isRefreshing && (
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 py-2.5 text-xs font-medium text-[var(--ep-primary)] shadow-sm"
            >
              <Icon name="loader-circle" size={15} className="animate-spin" />
              <span>Refreshing data…</span>
            </div>
          )}
          {!loading && isDbConnected && lastUpdatedAt && (
            <div
              className="mb-3 flex items-center justify-end gap-2 text-[11px] text-[var(--ep-text-muted)]"
              aria-label={`Dashboard data last updated at ${lastUpdatedAt.toLocaleTimeString()}`}
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--ep-status-success)]" />
              <span>Live data · Updated {lastUpdatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Direct, thumb-friendly access to the five primary facility modules. */}
      <nav
        aria-label="Quick dashboard navigation"
        className="fixed inset-x-0 bottom-0 z-[70] grid grid-cols-5 gap-1 border-t border-[var(--ep-line)] bg-[color-mix(in_srgb,var(--ep-surface)_98%,transparent)] px-2 pt-1.5 pb-[max(.4rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-24px_rgba(15,23,42,.42)] backdrop-blur-xl lg:hidden"
      >
        {DASHBOARD_QUICK_LINKS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/") ||
            (item.key === "home" && pathname === "/dashboard/overview") ||
            (item.key === "vision" && pathname === "/dashboard/vision");
          return (
            <Link
              key={item.key}
              to={item.href as never}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              data-active={active ? "true" : undefined}
              activeOptions={{ exact: true }}
              className={"flex min-h-14 min-w-0 touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl border border-transparent px-0.5 py-1 text-[10px] leading-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-inset " + (active ? "border-[var(--ep-accent)]/20 bg-[var(--ep-accent-tint)] font-bold text-[var(--ep-primary)]" : "font-semibold text-[var(--ep-text-muted)] hover:bg-[var(--ep-tint)] hover:text-[var(--ep-text)]")}
            >
              <span className={"flex h-8 w-10 items-center justify-center rounded-xl transition-colors " + (active ? "bg-[var(--ep-accent)] text-[var(--ep-on-accent)] shadow-sm" : "bg-transparent text-current")}>
                <Icon name={item.icon} size={19} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span className="max-w-full truncate">
                {item.key === "water" ? "Water" : item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
