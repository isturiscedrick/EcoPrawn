import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import { DASHBOARD_NAV_ITEMS, type DashboardView } from "@/config/nav";
import { Icon } from "@/components/ui/Icon";
import { SidebarNavItem } from "./SidebarNavItem";
import { LogoutIcon, drawerRowClass } from "./SidebarPrimitives";

interface DashboardDesktopSidebarProps {
  collapsed: boolean;
  pathname: string;
  activeView: DashboardView;
  profileName: string;
  profileRole: string;
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
  onToggleCollapsed,
  onLogoutClick,
  onMobileClose,
}: DashboardDesktopSidebarProps) {
  return (
    <aside
      id="dashboard-sidebar"
      className={`fixed bottom-0 left-0 top-0 z-30 hidden flex-col border-r border-[var(--ep-line)] bg-[var(--ep-surface)] transition-[width] duration-300 ease-in-out lg:flex ${collapsed ? "w-[76px]" : "w-[260px]"}`}
    >
      <div className={`flex min-h-[68px] shrink-0 items-center border-b border-[var(--ep-line)] py-3 ${collapsed ? "justify-center gap-1 px-1" : "justify-between gap-3 px-5"}`}>
        <Link
          to="/dashboard"
          aria-label="EcoPrawn dashboard"
          title={collapsed ? "EcoPrawn dashboard" : undefined}
          className={`flex min-w-0 items-center rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] ${collapsed ? "shrink-0" : ""}`}
        >
          <BrandMark size={collapsed ? 28 : 32} showWordmark={!collapsed} />
        </Link>
        <button type="button" onClick={onToggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-pressed={collapsed} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]">
          <Icon name="sidebar-toggle" size={18} />
        </button>
      </div>
      <div className={`shrink-0 border-b border-[var(--ep-line)] py-3 ${collapsed ? "px-2" : "px-4"}`}>
        <Link to="/dashboard/profile" title={collapsed ? profileName : undefined} className={`flex w-full items-center gap-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] py-3 text-left transition-colors hover:bg-[var(--ep-tint)] ${collapsed ? "justify-center px-1" : "px-3"}`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ep-accent-tint)] text-[var(--ep-accent)]" aria-hidden="true"><Icon name="user-round" size={19} strokeWidth={1.9} /></span>
          <span className={`min-w-0 ${collapsed ? "hidden" : ""}`}>
            <span className="block truncate text-sm font-semibold text-[var(--ep-text)]">{profileName}</span>
            <span className="block truncate text-[11px] text-[var(--ep-text-muted)]">{profileRole}</span>
          </span>
        </Link>
      </div>
      <div className={`min-h-0 flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-4"}`}>
        {!collapsed && <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ep-text-muted)]">Navigation</div>}
        <nav aria-label="Dashboard modules" className="flex flex-col items-stretch gap-1.5">
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.label} item={item} active={item.view === activeView} collapsed={collapsed} />
          ))}
        </nav>
      </div>
      <div className={`flex shrink-0 flex-col gap-2 border-t border-[var(--ep-line)] bg-[var(--ep-bg)] py-4 ${collapsed ? "items-center px-2" : "px-4"}`}>
        <Link to="/dashboard/settings" aria-current={pathname.startsWith("/dashboard/settings") ? "page" : undefined} title={collapsed ? "Settings" : undefined} className={drawerRowClass + (collapsed ? " !w-11 !justify-center !px-0" : "") + (pathname.startsWith("/dashboard/settings") ? " dashboard-nav-active" : "")} onClick={onMobileClose}>
          <span className="flex w-5 shrink-0 items-center justify-center"><Icon name="settings" size={19} strokeWidth={1.8} /></span>
          {!collapsed && "Settings"}
        </Link>
        <button type="button" onClick={onLogoutClick} title={collapsed ? "Log out" : undefined} aria-label="Log out" className={`dashboard-logout-button flex min-h-11 items-center gap-2.5 rounded-lg py-2.5 text-left text-[14.5px] font-semibold transition-colors ${collapsed ? "w-11 justify-center px-0" : "w-full px-3"}`}>
          <span className="flex w-4 justify-center" aria-hidden="true"><LogoutIcon /></span>
          {!collapsed && "Log out"}
        </button>
      </div>
    </aside>
  );
}
