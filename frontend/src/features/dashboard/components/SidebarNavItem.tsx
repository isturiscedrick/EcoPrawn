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
  const destination =
    item.view === "overview" ? "/dashboard" : `/dashboard/${item.view}`;
  const pending = useRouterState({
    select: (state) =>
      state.status === "pending" && state.location.pathname === destination,
  });

  return (
    <Link
      to={item.view === "overview" ? "/dashboard" : `/dashboard/${item.view}`}
      preload={active ? false : "viewport"}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mangrove-light)] ${
        collapsed ? "lg:mx-auto lg:w-11" : "lg:w-full"
      }`}
      activeOptions={{ exact: true }}
    >
      <span
        aria-busy={pending}
        className={`flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-[15px] font-medium transition-colors duration-200 lg:w-full ${
          collapsed
            ? "lg:mx-auto lg:h-11 lg:!w-11 lg:justify-center lg:px-0 lg:py-0"
            : ""
        } ${
          active || pending
            ? "dashboard-nav-active border border-[rgba(232,98,58,0.7)] bg-white font-semibold text-[var(--water-deep)] shadow-[0_6px_14px_-10px_rgba(11,46,51,0.55)]"
            : "text-[rgba(11,46,51,0.68)] hover:bg-[rgba(11,46,51,0.06)] hover:text-[var(--water-deep)]"
        }`}
      >
        <span
          aria-hidden="true"
          className="relative flex w-4 shrink-0 justify-center"
        >
          <Icon
            name={item.icon}
            size={16}
            strokeWidth={1.8}
            className={pending && collapsed ? "opacity-0" : ""}
          />
          {pending && collapsed && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
            </span>
          )}
        </span>
        <span className={collapsed ? "lg:hidden" : undefined}>
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
        ) : active ? (
          <span
            className={`dashboard-nav-active-dot ml-auto hidden h-1.5 w-1.5 rounded-full bg-[var(--coral)] lg:block ${collapsed ? "lg:hidden" : ""}`}
          />
        ) : null}
      </span>
    </Link>
  );
}
