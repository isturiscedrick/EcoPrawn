import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MOTION_ALLOWED_QUERY } from "@/components/motion/motionRuntime";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import { DASHBOARD_NAV_ITEMS, type DashboardView } from "@/config/nav";
import { Icon } from "@/components/ui/Icon";
import { SidebarNavItem } from "./SidebarNavItem";
import { DashboardDesktopSidebar } from "./DashboardDesktopSidebar";
import { LogoutIcon, drawerRowClass } from "./SidebarPrimitives";
import { DashboardLogoutDialog } from "./DashboardLogoutDialog";
import { recordAuditEvent } from "@/features/dashboard/lib/audit-log";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({
  mobileOpen = false,
  onMobileClose = () => {},
  collapsed = false,
  onToggleCollapsed = () => {},
}: SidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const segment = pathname.split("/dashboard/")[1] || "overview";
  const activeView = segment as DashboardView;

  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [profileName, setProfileName] = useState("Facility Operator");
  const [profileRole, setProfileRole] = useState("FACILITY OPERATOR");

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const logoutDialogRef = useRef<HTMLDivElement>(null);
  const logoutCancelRef = useRef<HTMLButtonElement>(null);
  const logoutOpenerRef = useRef<HTMLElement | null>(null);
  const loggingOutRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const touchDrawerWidth = useRef<number>(0);
  const touchGestureActive = useRef(false);

  const closeDrawer = useCallback(() => {
    onMobileClose();
  }, [onMobileClose]);

  useEffect(() => {
    const savedName = window.localStorage.getItem("ep-profile-name");
    const savedRole = window.localStorage.getItem("ep-profile-role");
    if (savedName) setProfileName(savedName);
    if (savedRole) setProfileRole(savedRole.toUpperCase());
  }, []);

  // Any route change closes the drawer.
  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  // Drawer content choreography. The drawer's existing CSS transform owns
  // its slide-in; GSAP animates only the inner rows to avoid transform conflicts.
  useLayoutEffect(() => {
    if (!mobileOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_ALLOWED_QUERY, () => {
      const ctx = gsap.context(() => {
        const header = drawer.querySelector<HTMLElement>(":scope > div:first-child");
        const profile = drawer.querySelector<HTMLElement>(":scope > div:nth-child(2)");
        const navItems = drawer.querySelectorAll<HTMLElement>("nav > a, nav > button");
        const footer = drawer.querySelector<HTMLElement>(":scope > div:last-child");
        if (header) gsap.fromTo(header, { y: -8, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.32, ease: "power3.out", clearProps: "transform,opacity,visibility",
        });
        if (profile) gsap.fromTo(profile, { y: 10, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.38, delay: 0.06, ease: "power3.out", clearProps: "transform,opacity,visibility",
        });
        if (navItems.length) gsap.fromTo(navItems, { x: -12, autoAlpha: 0 }, {
          x: 0, autoAlpha: 1, duration: 0.34, stagger: 0.045, delay: 0.1,
          ease: "power3.out", clearProps: "transform,opacity,visibility",
        });
        if (footer) gsap.fromTo(footer, { y: 12, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.34, delay: 0.18, ease: "power3.out",
          clearProps: "transform,opacity,visibility",
        });
      }, drawer);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, [mobileOpen]);

  // Lock the document without losing its scroll position (including on iOS).
  // Restore the exact inline styles and scroll offset when the drawer closes.
  useEffect(() => {
    if (!mobileOpen) return;
    const body = document.body;
    const root = document.documentElement;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      overscrollBehavior: root.style.overscrollBehavior,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    closeButtonRef.current?.focus({ preventScroll: true });

    function getFocusableElements() {
      const drawer = drawerRef.current;
      if (!drawer) return [];
      return Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href]:not([aria-disabled="true"]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) =>
        !element.hasAttribute("hidden") &&
        element.getAttribute("aria-hidden") !== "true" &&
        element.getClientRects().length > 0,
      );
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        drawerRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      const focusIsInsideDrawer = !!activeElement && drawerRef.current?.contains(activeElement);

      if (e.shiftKey && (!focusIsInsideDrawer || activeElement === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!focusIsInsideDrawer || activeElement === last)) {
        e.preventDefault();
        first.focus();
      }
    }

    function keepFocusInsideDrawer(event: FocusEvent) {
      if (event.target instanceof Node && !drawerRef.current?.contains(event.target)) {
        closeButtonRef.current?.focus({ preventScroll: true });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", keepFocusInsideDrawer);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", keepFocusInsideDrawer);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      root.style.overscrollBehavior = previous.overscrollBehavior;
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen, closeDrawer]);

  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  function onLogoutClick() {
    logoutOpenerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setLogoutError("");
    setConfirmingLogout(true);
  }

  async function onConfirmLogout() {
    loggingOutRef.current = true;
    setLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      recordAuditEvent({ entity: "User", action: "Signed out", target: profileName, details: "User ended the current session." });
      window.location.replace("/login");
    } catch {
      setLogoutError("Could not log out. Please try again.");
      loggingOutRef.current = false;
      setLoggingOut(false);
    }
  }

  function onCancelLogout() {
    if (loggingOut) return;
    setConfirmingLogout(false);
  }

  useEffect(() => {
    if (!confirmingLogout) return;

    const body = document.body;
    const root = document.documentElement;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      overscrollBehavior: root.style.overscrollBehavior,
    };

    // Use the same fixed-body lock as the mobile drawer. Overflow alone is
    // unreliable on mobile browsers and can allow the page behind the dialog
    // to scroll while the confirmation is open.
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    logoutCancelRef.current?.focus({ preventScroll: true });

    function getFocusableElements() {
      const dialog = logoutDialogRef.current;
      if (!dialog) return [];
      return Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )).filter((element) =>
        !element.hasAttribute("hidden") &&
        element.getAttribute("aria-hidden") !== "true" &&
        element.getClientRects().length > 0,
      );
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!loggingOutRef.current) {
          event.preventDefault();
          setConfirmingLogout(false);
        }
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        logoutDialogRef.current?.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const insideDialog = !!active && logoutDialogRef.current?.contains(active);
      if (event.shiftKey && (!insideDialog || active === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!insideDialog || active === last)) {
        event.preventDefault();
        first.focus();
      }
    }

    function keepFocusInsideDialog(event: FocusEvent) {
      if (event.target instanceof Node && !logoutDialogRef.current?.contains(event.target)) {
        logoutCancelRef.current?.focus({ preventScroll: true });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", keepFocusInsideDialog);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", keepFocusInsideDialog);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      root.style.overscrollBehavior = previous.overscrollBehavior;
      window.scrollTo(0, scrollY);
      const opener = logoutOpenerRef.current;
      const openerIsUnavailable = !opener?.isConnected ||
        !!opener?.closest('[inert], [aria-hidden="true"]');
      if (!openerIsUnavailable) opener?.focus({ preventScroll: true });
      logoutOpenerRef.current = null;
    };
  }, [confirmingLogout]);

  return (
    <>
      <DashboardDesktopSidebar
        collapsed={collapsed}
        pathname={pathname}
        activeView={activeView}
        profileName={profileName}
        profileRole={profileRole}
        onToggleCollapsed={onToggleCollapsed}
        onLogoutClick={onLogoutClick}
        onMobileClose={onMobileClose}
      />

      {/* DRAWER (mobile and tablet) */}
      <div className="lg:hidden">
        <div
          aria-hidden="true"
          data-state={mobileOpen ? "open" : "closed"}
          onClick={closeDrawer}
          className={`fixed inset-0 z-[80] bg-[rgba(8,30,34,0.55)] backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none dark:bg-[rgba(0,0,0,0.72)] ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <div
          id="dashboard-mobile-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard menu"
          aria-hidden={!mobileOpen}
          data-state={mobileOpen ? "open" : "closed"}
          inert={!mobileOpen}
          onTouchStart={(e) => {
            if (e.touches.length !== 1) return;
            const touch = e.touches[0];
            touchStartX.current = touch.clientX;
            touchStartY.current = touch.clientY;
            touchStartTime.current = Date.now();
            touchDrawerWidth.current = drawerRef.current?.getBoundingClientRect().width ?? 0;
            touchGestureActive.current = false;
          }}
          onTouchMove={(e) => {
            const startX = touchStartX.current;
            const startY = touchStartY.current;
            if (startX === null || startY === null || e.touches.length !== 1) return;
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;

            // Ignore vertical scrolling and only engage after a clear horizontal intent.
            if (!touchGestureActive.current) {
              if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < 8) return;
              touchGestureActive.current = true;
            }
            if (deltaX >= 0) return;

            const drawer = drawerRef.current;
            if (!drawer) return;
            drawer.style.transition = "none";
            drawer.style.transform = `translate3d(${Math.max(deltaX, -touchDrawerWidth.current)}px, 0, 0)`;
          }}
          onTouchEnd={(e) => {
            const startX = touchStartX.current;
            const wasDragging = touchGestureActive.current;
            const drawer = drawerRef.current;
            touchStartX.current = null;
            touchStartY.current = null;
            touchGestureActive.current = false;

            if (drawer) {
              const endX = e.changedTouches[0]?.clientX ?? startX ?? 0;
              const distance = Math.max(0, (startX ?? endX) - endX);
              const elapsed = Math.max(1, Date.now() - touchStartTime.current);
              const velocity = distance / elapsed;
              const closeDistance = Math.max(48, touchDrawerWidth.current * 0.28);
              drawer.style.transition = "";
              drawer.style.transform = "";
              if (wasDragging && (distance >= closeDistance || (distance >= 28 && velocity >= 0.5))) {
                closeDrawer();
              }
            }
          }}
          onTouchCancel={() => {
            touchStartX.current = null;
            touchStartY.current = null;
            touchGestureActive.current = false;
            if (drawerRef.current) {
              drawerRef.current.style.transition = "";
              drawerRef.current.style.transform = "";
            }
          }}
          className={`ep-mobile-dashboard-drawer fixed inset-y-0 left-0 z-[90] flex w-[min(88vw,360px)] flex-col overflow-hidden rounded-r-[1.4rem] pt-[env(safe-area-inset-top)] border-r border-[var(--ep-line)] bg-[var(--ep-bg)] text-[var(--ep-text)] shadow-[12px_0_44px_-18px_rgba(8,30,34,0.38)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
            mobileOpen
              ? "translate-x-0 shadow-[8px_0_40px_-12px_rgba(8,30,34,0.45)]"
              : "-translate-x-full shadow-none"
          }`}
        >
          {/* Drawer header */}
          <div className="relative flex shrink-0 items-center justify-between border-b border-[var(--ep-line)] px-5 py-4">
            <div className="flex min-w-0 flex-col gap-1">
              <BrandMark size={32} logoColor="var(--ep-primary)" logoTextColor="var(--ep-text)" />
              <span className="ep-mobile-drawer-caption pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ep-text-muted)]">EcoPrawn Dashboard</span>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Close navigation menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)] shadow-sm transition-all duration-200 hover:rotate-90 hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)]"
            >
              <Icon name="x" size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Profile */}
          <div className="shrink-0 border-b border-[var(--ep-line)] px-4 py-3">
            <Link
              to="/dashboard/profile"
              aria-label="Edit user profile"
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 py-3 text-left transition-colors hover:bg-[var(--ep-tint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]"
              activeOptions={{ exact: true }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
                style={{ background: "var(--ep-accent-tint)", color: "var(--ep-primary)" }}
                aria-hidden="true"
              >
                <Icon name="user-round" size={19} strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-[var(--ep-text)]">
                  {profileName}
                </div>
                <div className="ep-font-mono truncate text-xs text-[var(--ep-text-muted)]">
                  {profileRole}
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ep-text-muted)]">
              Navigation
            </div>
            <nav aria-label="Dashboard modules" className="flex flex-col items-stretch gap-1.5">
              {DASHBOARD_NAV_ITEMS.map((item) => (
                <SidebarNavItem
                  key={item.label}
                  item={item}
                  active={item.view === activeView}
                  collapsed={false}
                />
              ))}
            </nav>
          </div>

          {/* Account actions */}
          <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--ep-line)] bg-[var(--ep-surface)]/70 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Link to="/dashboard/settings" aria-current={pathname.startsWith("/dashboard/settings") ? "page" : undefined} className={drawerRowClass + (pathname.startsWith("/dashboard/settings") ? " dashboard-nav-active" : "")} onClick={onMobileClose}>
            <span className="flex w-4 justify-center"><Icon name="settings" size={16} /></span>
            Settings
          </Link>
            <button
              type="button"
              onClick={() => {
                onMobileClose();
                onLogoutClick();
              }}
              className="dashboard-logout-button flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14.5px] font-semibold transition-colors duration-200"
            >
              <span className="flex w-4 justify-center" aria-hidden="true">
                <LogoutIcon />
              </span>
              Log out
            </button>
          </div>
        </div>
      </div>

      {confirmingLogout && (
        <DashboardLogoutDialog
          dialogRef={logoutDialogRef}
          cancelRef={logoutCancelRef}
          error={logoutError}
          loggingOut={loggingOut}
          onCancel={onCancelLogout}
          onConfirm={onConfirmLogout}
        />
      )}
    </>
  );
}