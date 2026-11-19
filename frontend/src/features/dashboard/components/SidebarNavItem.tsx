import { useState, useRef, useEffect, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Link, useRouterState } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import type { DashboardNavItem } from "@/config/nav";

interface SidebarNavItemProps {
  item: DashboardNavItem;
  active: boolean;
  collapsed: boolean;
  alertCount?: number;
  tankCount?: number;
}

function NavTooltip({
  targetRef,
  label,
  description,
  badge,
  badgeVariant,
}: {
  targetRef: RefObject<HTMLElement | null>;
  label: string;
  description?: string;
  badge?: string;
  badgeVariant?: string;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  }, [targetRef]);

  if (!coords || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="tooltip"
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        transform: "translateY(-50%)",
      }}
      className="z-[9999] pointer-events-none hidden lg:flex items-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)]/95 px-3 py-2 text-xs text-[var(--ep-text)] shadow-2xl backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 font-semibold">
          <span>{label}</span>
          {badge && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                badgeVariant === "ai"
                  ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/35"
                  : badgeVariant === "alert"
                  ? "bg-rose-500 text-white"
                  : "bg-[var(--ep-tint)] text-[var(--ep-primary)]"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <span className="text-[10px] text-[var(--ep-text-muted)] font-normal max-w-[210px] leading-tight">
            {description}
          </span>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function SidebarNavItem({
  item,
  active,
  collapsed,
  alertCount = 0,
  tankCount = 0,
}: SidebarNavItemProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);

  const destination = item.view === "overview" ? "/dashboard" : `/dashboard/${item.view}`;
  const currentPath = useRouterState({ select: (state) => state.location.pathname });
  const routeActive =
    active ||
    (item.view === "overview"
      ? currentPath === "/dashboard" || currentPath === "/dashboard/overview"
      : currentPath === destination || currentPath.startsWith(destination + "/"));
  const pending = useRouterState({
    select: (state) => state.status === "pending" && state.location.pathname === destination,
  });

  const isAi = item.view === "assistant";
  const isAlerts = item.view === "alerts";
  const hasAlertBadge = isAlerts && alertCount > 0;

  // Determine badge text and variant
  let badgeText = item.badge;
  let badgeVariant = item.badgeVariant ?? "default";
  if (hasAlertBadge) {
    badgeText = alertCount > 9 ? "9+" : String(alertCount);
    badgeVariant = "alert";
  } else if (item.view === "tanks" && tankCount > 0) {
    badgeText = String(tankCount);
    badgeVariant = "default";
  }

  return (
    <>
      <Link
        ref={linkRef}
        to={item.view === "overview" ? "/dashboard" : `/dashboard/${item.view}`}
        preload={routeActive ? false : "viewport"}
        aria-label={item.label}
        aria-current={routeActive ? "page" : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className={`group relative rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] ${
          collapsed ? "lg:mx-auto lg:w-11" : "lg:w-full"
        }`}
        activeOptions={{ exact: true }}
      >
        <span
          aria-busy={pending}
          className={`relative flex min-h-12 touch-manipulation items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14.5px] font-medium transition-all duration-200 lg:w-full ${
            collapsed ? "lg:mx-auto lg:h-11 lg:!w-11 lg:justify-center lg:px-0 lg:py-0" : ""
          } ${
            routeActive || pending
              ? "dashboard-nav-active border border-[var(--ep-accent)]/40 bg-[var(--ep-accent-tint)] font-semibold text-[var(--ep-text)] shadow-sm"
              : isAi
              ? "border border-teal-500/20 bg-gradient-to-r from-teal-500/5 via-emerald-500/5 to-transparent text-[var(--ep-text)] hover:border-teal-500/40 hover:bg-teal-500/10"
              : "text-[var(--ep-text-muted)] hover:bg-[var(--ep-tint)] hover:text-[var(--ep-text)]"
          }`}
        >
          {/* 1. Icon Container (always first child for CSS selectors) */}
          <span
            aria-hidden="true"
            className="relative flex h-8 w-8 shrink-0 items-center justify-center"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                routeActive
                  ? "bg-[var(--ep-accent-tint)] text-[var(--ep-primary)] shadow-2xs"
                  : isAi
                  ? "bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-600 dark:text-teal-400 group-hover:scale-105"
                  : "group-hover:scale-105"
              }`}
            >
              <Icon
                name={item.icon}
                size={17}
                strokeWidth={routeActive ? 2.1 : 1.8}
                className={pending && collapsed ? "opacity-0" : ""}
              />
            </span>

            {/* Pending Spinner in Collapsed Mode */}
            {pending && collapsed && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
              </span>
            )}

            {/* Collapsed Alert Indicator Dot */}
            {collapsed && hasAlertBadge && !pending && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-[var(--ep-surface)]" />
              </span>
            )}

            {/* Collapsed AI Sparkle Dot */}
            {collapsed && isAi && !routeActive && !pending && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
            )}
          </span>

          {/* 2. Label (always second child for CSS selectors) */}
          <span className={`min-w-0 flex-1 truncate ${collapsed ? "lg:hidden" : ""}`}>
            {item.label}
          </span>

          {/* 3. Active Accent Bar on Left edge */}
          {routeActive && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--ep-primary)]"
            />
          )}

          {/* 4. Pending Spinner in Expanded Mode */}
          {pending && !collapsed ? (
            <span
              role="status"
              aria-label={`Opening ${item.label}`}
              className="ml-auto inline-flex"
            >
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
            </span>
          ) : null}

          {/* 5. Expanded Badges */}
          {!collapsed && !pending && (
            <>
              {badgeText && (
                <span
                  className={`ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-tight transition-all ${
                    badgeVariant === "ai"
                      ? "border border-teal-500/35 bg-gradient-to-r from-teal-500/15 to-emerald-500/15 text-teal-600 dark:text-teal-300 shadow-2xs"
                      : badgeVariant === "alert"
                      ? "bg-rose-500 text-white font-bold leading-none px-1.5 py-0.5 rounded-full shadow-2xs"
                      : "bg-[var(--ep-tint)] text-[var(--ep-text-muted)] group-hover:text-[var(--ep-primary)]"
                  }`}
                >
                  {isAi && <Icon name="sparkles" size={10} className="animate-pulse" />}
                  {badgeText}
                </span>
              )}

              {/* Active Dot indicator when no badge */}
              {routeActive && !badgeText && (
                <span
                  className="dashboard-nav-active-dot ml-auto hidden h-1.5 w-1.5 rounded-full bg-[var(--ep-accent)] lg:block"
                />
              )}
            </>
          )}
        </span>
      </Link>

      {/* Floating Tooltip in Collapsed Mode */}
      {collapsed && hovered && (
        <NavTooltip
          targetRef={linkRef}
          label={item.label}
          description={item.description}
          badge={badgeText}
          badgeVariant={badgeVariant}
        />
      )}
    </>
  );
}
