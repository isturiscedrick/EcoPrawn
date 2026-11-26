import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import { DASHBOARD_NAV_ITEMS, type DashboardView } from "@/config/nav";
import { Icon } from "@/components/ui/Icon";
import { SidebarNavItem } from "./SidebarNavItem";
import { LogoutIcon, drawerRowClass, SidebarTooltip } from "./SidebarPrimitives";
import { ProfileAvatar } from "./ProfileAvatar";

interface DashboardDesktopSidebarProps {
  collapsed: boolean;
  pathname: string;
  activeView: DashboardView;
  profileName: string;
  profileRole: string;
  profileImage?: string | null;
  alertCount?: number;
  tankCount?: number;
  onToggleCollapsed: () => void;
  onLogoutClick: () => void;
  onMobileClose: () => void;
}

export function DashboardDesktopSidebar({
  collapsed,
  pathname,
  activeView,
  profileName,
  profileRole,
  profileImage,
  alertCount = 0,
  tankCount = 0,
  onToggleCollapsed,
  onLogoutClick,
  onMobileClose,
}: DashboardDesktopSidebarProps) {
  // Shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        onToggleCollapsed();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onToggleCollapsed]);

  // Tooltip refs for collapsed mode
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLAnchorElement>(null);
  const settingsRef = useRef<HTMLAnchorElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);

  const [hoveredToggle, setHoveredToggle] = useState(false);
  const [hoveredProfile, setHoveredProfile] = useState(false);
  const [hoveredSettings, setHoveredSettings] = useState(false);
  const [hoveredLogout, setHoveredLogout] = useState(false);

  const isSettingsActive = pathname.startsWith("/dashboard/settings");

  // Filter grouped items
  const operationsItems = DASHBOARD_NAV_ITEMS.filter((i) => i.section === "operations");
  const intelligenceItems = DASHBOARD_NAV_ITEMS.filter((i) => i.section === "intelligence");
  const systemItems = DASHBOARD_NAV_ITEMS.filter((i) => i.section === "system");

  return (
    <aside
      id="dashboard-sidebar"
      data-collapsed={collapsed}
      className={`fixed bottom-0 left-0 top-0 z-30 hidden flex-col border-r border-[var(--ep-line)] bg-[var(--ep-surface)] transition-[width] duration-300 ease-in-out lg:flex ${
        collapsed ? "w-[88px]" : "w-[268px]"
      }`}
    >
      {/* 1. HEADER */}
      <div
        className={`flex shrink-0 items-center border-b border-[var(--ep-line)] py-3 ${
          collapsed
            ? "min-h-[72px] justify-center px-2"
            : "min-h-[72px] justify-between gap-3 px-5"
        }`}
      >
        {collapsed ? (
          <button
            ref={toggleBtnRef}
            type="button"
            onClick={onToggleCollapsed}
            onMouseEnter={() => setHoveredToggle(true)}
            onMouseLeave={() => setHoveredToggle(false)}
            onFocus={() => setHoveredToggle(true)}
            onBlur={() => setHoveredToggle(false)}
            aria-label="Expand sidebar (Ctrl+B)"
            aria-pressed="true"
            className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]"
          >
            <span className="transition-opacity duration-150 group-hover:opacity-0 group-focus-visible:opacity-0">
              <BrandMark size={30} showWordmark={false} />
            </span>
            <Icon
              name="sidebar-toggle"
              size={20}
              className="absolute rotate-180 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          </button>
        ) : (
          <>
            <Link
              to="/dashboard"
              aria-label="EcoPrawn dashboard"
              className="group flex min-w-0 items-center gap-2 rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]"
            >
              <BrandMark size={32} showWordmark />
            </Link>
            <button
              ref={toggleBtnRef}
              type="button"
              onClick={onToggleCollapsed}
              onMouseEnter={() => setHoveredToggle(true)}
              onMouseLeave={() => setHoveredToggle(false)}
              onFocus={() => setHoveredToggle(true)}
              onBlur={() => setHoveredToggle(false)}
              aria-label="Collapse sidebar (Ctrl+B)"
              aria-pressed="false"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-transparent text-[var(--ep-text-muted)] transition-all duration-200 hover:border-[var(--ep-line)] hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]"
            >
              <Icon name="sidebar-toggle" size={18} />
            </button>
          </>
        )}

        {collapsed && hoveredToggle && (
          <SidebarTooltip targetRef={toggleBtnRef}>
            <span className="font-semibold">Expand sidebar</span>
            <kbd className="rounded border border-[var(--ep-line)] px-1 py-0.5 text-[10px] text-[var(--ep-text-muted)]">
              ⌘B
            </kbd>
          </SidebarTooltip>
        )}
      </div>

      {/* 2. PROFILE CARD */}
      <div className={`shrink-0 border-b border-[var(--ep-line)] py-3 ${collapsed ? "px-2" : "px-4"}`}>
        <Link
          ref={profileRef}
          to="/dashboard/profile"
          onMouseEnter={() => setHoveredProfile(true)}
          onMouseLeave={() => setHoveredProfile(false)}
          onFocus={() => setHoveredProfile(true)}
          onBlur={() => setHoveredProfile(false)}
          className={`group flex w-full items-center gap-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] py-2.5 text-left transition-all duration-200 hover:border-[var(--ep-accent)]/40 hover:bg-[var(--ep-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] ${
            collapsed ? "justify-center px-1" : "px-3"
          }`}
        >
          {/* Avatar with Live Status Pulse */}
          <div className="relative shrink-0">
            <ProfileAvatar name={profileName} image={profileImage} />
            <span
              title="Telemetry Connected"
              className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-[var(--ep-surface)]" />
            </span>
          </div>

          <div className={`min-w-0 flex-1 ${collapsed ? "hidden" : ""}`}>
            <div className="truncate text-sm font-semibold text-[var(--ep-text)] group-hover:text-[var(--ep-primary)] transition-colors">
              {profileName}
            </div>
            <div className="truncate text-[11px] font-medium text-[var(--ep-text-muted)]">
              {profileRole}
            </div>
          </div>
        </Link>

        {collapsed && hoveredProfile && (
          <SidebarTooltip targetRef={profileRef}>
            <div className="flex flex-col">
              <span className="font-semibold">{profileName}</span>
              <span className="text-[10px] text-[var(--ep-text-muted)]">{profileRole}</span>
            </div>
          </SidebarTooltip>
        )}
      </div>

      {/* 4. NAVIGATION MODULES */}
      <div className={`min-h-0 flex-1 overflow-y-auto py-3 space-y-4 ${collapsed ? "px-2" : "px-4"}`}>
        {/* Operations Section */}
        <div>
          {!collapsed && (
            <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]">
              Operations
            </div>
          )}
          <nav aria-label="Facility operations" className="flex flex-col items-stretch gap-1">
            {operationsItems.map((item) => (
              <SidebarNavItem
                key={item.label}
                item={item}
                active={item.view === activeView}
                collapsed={collapsed}
                alertCount={alertCount}
                tankCount={tankCount}
              />
            ))}
          </nav>
        </div>

        {/* Intelligence / AI Section (in collapsed mode or full list) */}
        <div>
          {!collapsed && (
            <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]">
              Intelligence
            </div>
          )}
          {collapsed && <div className="h-px w-8 mx-auto bg-[var(--ep-line)] my-1.5" />}
          <nav aria-label="AI Intelligence" className="flex flex-col items-stretch gap-1">
            {intelligenceItems.map((item) => (
              <SidebarNavItem
                key={item.label}
                item={item}
                active={item.view === activeView}
                collapsed={collapsed}
                alertCount={alertCount}
                tankCount={tankCount}
              />
            ))}
          </nav>
        </div>

        {/* Monitoring & System Section */}
        <div>
          {!collapsed && (
            <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]">
              System & Alarms
            </div>
          )}
          {collapsed && <div className="h-px w-8 mx-auto bg-[var(--ep-line)] my-1.5" />}
          <nav aria-label="System and alerts" className="flex flex-col items-stretch gap-1">
            {systemItems.map((item) => (
              <SidebarNavItem
                key={item.label}
                item={item}
                active={item.view === activeView}
                collapsed={collapsed}
                alertCount={alertCount}
                tankCount={tankCount}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* 5. FOOTER ACTIONS (Settings & Logout) */}
      <div
        className={`flex shrink-0 flex-col gap-2 border-t border-[var(--ep-line)] bg-[var(--ep-bg)] py-3 ${
          collapsed ? "items-center px-2" : "px-4"
        }`}
      >
        <Link
          ref={settingsRef}
          to="/dashboard/settings"
          aria-current={isSettingsActive ? "page" : undefined}
          onMouseEnter={() => setHoveredSettings(true)}
          onMouseLeave={() => setHoveredSettings(false)}
          onFocus={() => setHoveredSettings(true)}
          onBlur={() => setHoveredSettings(false)}
          className={
            drawerRowClass +
            (collapsed ? " !w-11 !justify-center !px-0" : "") +
            (isSettingsActive
              ? " dashboard-nav-active border border-[var(--ep-accent)]/40 bg-[var(--ep-accent-tint)] font-semibold text-[var(--ep-text)]"
              : "")
          }
          onClick={onMobileClose}
        >
          <span className="flex w-5 shrink-0 items-center justify-center">
            <Icon name="settings" size={18} strokeWidth={1.8} />
          </span>
          {!collapsed && <span>Settings</span>}
        </Link>

        {collapsed && hoveredSettings && (
          <SidebarTooltip targetRef={settingsRef}>
            <span className="font-semibold">Settings</span>
          </SidebarTooltip>
        )}

        <button
          ref={logoutRef}
          type="button"
          onClick={onLogoutClick}
          onMouseEnter={() => setHoveredLogout(true)}
          onMouseLeave={() => setHoveredLogout(false)}
          onFocus={() => setHoveredLogout(true)}
          onBlur={() => setHoveredLogout(false)}
          aria-label="Log out"
          className={`dashboard-logout-button group flex min-h-11 items-center gap-2.5 rounded-xl py-2.5 text-left text-[14.5px] font-semibold transition-all duration-200 active:scale-[0.99] ${
            collapsed ? "w-11 justify-center px-0" : "w-full px-3"
          }`}
        >
          <span className="flex w-5 shrink-0 items-center justify-center" aria-hidden="true">
            <LogoutIcon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
          {!collapsed && <span>Log out</span>}
        </button>

        {collapsed && hoveredLogout && (
          <SidebarTooltip targetRef={logoutRef}>
            <span className="font-semibold text-red-600 dark:text-red-400">Log out</span>
          </SidebarTooltip>
        )}

        {!collapsed && (
          <div className="flex items-center justify-between px-1 pt-1 text-[10px] text-[var(--ep-text-muted)]">
            <span>EcoPrawn OS</span>
            <span>Ctrl + B to toggle</span>
          </div>
        )}
      </div>
    </aside>
  );
}
