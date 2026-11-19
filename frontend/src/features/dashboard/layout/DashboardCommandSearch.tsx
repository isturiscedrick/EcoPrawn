import type { RefObject } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { DASHBOARD_NAV_ITEMS } from "@/config/nav";
import type { Tank } from "@/features/dashboard/context/TankContext";

interface DashboardCommandSearchProps {
  open: boolean;
  query: string;
  pages: typeof DASHBOARD_NAV_ITEMS;
  tanks: Tank[];
  inputRef: RefObject<HTMLInputElement | null>;
  dialogRef: RefObject<HTMLElement | null>;
  onQueryChange: (value: string) => void;
  onClose: (restoreFocus?: boolean) => void;
}

export function DashboardCommandSearch({
  open,
  query,
  pages,
  tanks,
  inputRef,
  dialogRef,
  onQueryChange,
  onClose,
}: DashboardCommandSearchProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-950/60 px-3 pt-[12vh] backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-search-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text)] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-[var(--ep-line)] px-4">
          <Icon name="search" size={19} className="shrink-0 text-[var(--ep-text-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search pages and tanks…"
            aria-label="Search dashboard"
            className="min-h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--ep-text-muted)]"
          />
          <kbd className="rounded-md border border-[var(--ep-line)] px-2 py-1 text-[10px] text-[var(--ep-text-muted)]">ESC</kbd>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-3">
          <h2 id="dashboard-search-title" className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--ep-text-muted)]">Pages</h2>
          {pages.length ? pages.map((item) => (
            <Link
              key={item.view}
              to={(item.view === "overview" ? "/dashboard" : `/dashboard/${item.view}`) as never}
              onClick={() => {
                onClose(false);
                onQueryChange("");
              }}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-[var(--ep-primary)]"
            >
              <Icon name={item.icon} size={17} className="text-[var(--ep-primary)]" />
              {item.label}
              <span className="ml-auto text-xs text-[var(--ep-text-muted)]">Open</span>
            </Link>
          )) : tanks.length === 0 ? (
            <p className="px-3 py-3 text-xs text-[var(--ep-text-muted)]">No results for “{query}”.</p>
          ) : null}
          {tanks.length > 0 && (
            <>
              <h2 className="px-2 pb-2 pt-4 text-[10px] font-bold uppercase tracking-wider text-[var(--ep-text-muted)]">Tanks</h2>
              {tanks.slice(0, 8).map((tank) => (
                <Link
                  key={tank.id}
                  to="/dashboard/tanks"
                  onClick={() => {
                    onClose(false);
                    onQueryChange("");
                  }}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors hover:bg-[var(--ep-tint)]"
                >
                  <Icon name="layers" size={17} className="text-[var(--ep-primary)]" />
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-[var(--ep-accent)]/30 bg-[var(--ep-accent-tint)]/60 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--ep-primary)] shadow-2xs">
                      #{tank.id.replace(/^tank-?/i, "").padStart(2, "0") || tank.id}
                    </span>
                    <span className="font-medium">{tank.name}</span>
                  </div>
                  <span className="ml-auto text-xs text-[var(--ep-text-muted)]">PL: {tank.pl}</span>
                </Link>
              ))}
            </>
          )}
        </div>
        <div className="border-t border-[var(--ep-line)] px-4 py-2.5 text-[10px] text-[var(--ep-text-muted)]">Quick search · Ctrl K / ⌘ K</div>
      </section>
    </div>
  );
}
