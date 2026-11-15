import { Link, useRouterState } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import type { DashboardNavItem } from "@/config/nav";

interface SidebarNavItemProps {
  item: DashboardNavItem;
  active: boolean;
  collapsed: boolean;
}

export function SidebarNavItem({
  item,
  active,
  collapsed,
}: SidebarNavItemProps) {
  const destination = item.view === "overview" ? "/dashboard" : `/dashboard/${item.view}`;
  const currentPath = useRouterState({ select: (state) => state.location.pathname });
  const routeActive = active || (item.view === "overview"
    ? currentPath === "/dashboard" || currentPath === "/dashboard/overview"
    : currentPath === destination || currentPath.startsWith(destination + "/"));
  const pending = useRouterState({
    select: (state) =>
      state.status === "pending" && state.location.pathname === destination,
  });

  return (
    <Link
      to={item.view === "overview" ? "/dashboard" : `/dashboard/${item.view}`}
      preload={routeActive ? false : "viewport"}
      aria-label={item.label}
      title={item.label}
      aria-current={routeActive ? "page" : undefined}
      className={`rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)] ${
        collapsed ? "lg:mx-auto lg:w-11" : "lg:w-full"
      }`}
      activeOptions={{ exact: true }}
    >
      <span
        aria-busy={pending}
        className={`flex min-h-12 touch-manipulation items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[15px] font-medium transition-colors duration-200 lg:w-full ${
          collapsed
            ? "lg:mx-auto lg:h-11 lg:!w-11 lg:justify-center lg:px-0 lg:py-0"
            : ""
        } ${
          routeActive || pending
            ? "dashboard-nav-active border border-[var(--ep-accent)] bg-[var(--ep-accent-tint)] font-semibold text-[var(--ep-text)] shadow-sm"
            : "text-[var(--ep-text-muted)] hover:bg-[var(--ep-tint)] hover:text-[var(--ep-text)]"
        }`}
      >
        <span
          aria-hidden="true"
          className="relative flex h-8 w-8 shrink-0 items-center justify-center"
        >
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${routeActive ? "bg-[var(--ep-accent-tint)] text-[var(--ep-primary)]" : ""}`}>
            <Icon name={item.icon} size={17} strokeWidth={routeActive ? 2 : 1.8} className={pending && collapsed ? "opacity-0" : ""} />
          </span>
          {pending && collapsed && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
            </span>
          )}
        </span>
        <span className={`min-w-0 flex-1 truncate ${collapsed ? "lg:hidden" : ""}`}>
          {item.label}
        </span>
        {pending && !collapsed ? (
          <span
            role="status"
            aria-label={`Opening ${item.label}`}
            className="ml-auto inline-flex"
          >
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
          </span>
        ) : routeActive ? (
          <span
            className={`dashboard-nav-active-dot ml-auto hidden h-1.5 w-1.5 rounded-full bg-[var(--coral)] lg:block ${collapsed ? "lg:hidden" : ""}`}
          />
        ) : null}
      </span>
    </Link>
  );
}
