import { Icon } from "@/components/ui/Icon";

interface StateMessageProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`dashboard-skeleton-block ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--ep-line)] pb-6">
        <div className="space-y-2.5">
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="h-9 w-60" />
          <SkeletonBlock className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-11 w-32 rounded-xl" />
          <SkeletonBlock className="h-11 w-28 rounded-xl" />
        </div>
      </div>

      {/* 4 KPI cards skeleton (matches 4 KPI layout) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3.5 w-24" />
              <SkeletonBlock className="h-7 w-7 rounded-lg" />
            </div>
            <SkeletonBlock className="mt-4 h-9 w-28" />
            <SkeletonBlock className="mt-2.5 h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Tank cards snapshot & Activity feed */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <SkeletonBlock className="h-6 w-48" />
            <SkeletonBlock className="h-9 w-32 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-8 w-8 rounded-lg" />
                    <div>
                      <SkeletonBlock className="h-4 w-20" />
                      <SkeletonBlock className="mt-1 h-3 w-14" />
                    </div>
                  </div>
                  <SkeletonBlock className="h-5 w-16 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--ep-line)]">
                  <SkeletonBlock className="h-10 rounded-lg" />
                  <SkeletonBlock className="h-10 rounded-lg" />
                  <SkeletonBlock className="h-10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-sm">
          <SkeletonBlock className="h-6 w-36 mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)]">
                <SkeletonBlock className="h-8 w-8 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <SkeletonBlock className="h-3.5 w-3/4" />
                  <SkeletonBlock className="h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export type DashboardViewSkeletonVariant =
  | "alerts"
  | "activity"
  | "biofloc"
  | "feeding"
  | "profile"
  | "tanks"
  | "vision"
  | "water"
  | "assistant";

export function DashboardViewSkeleton({ variant = "water" }: { variant?: DashboardViewSkeletonVariant }) {
  return (
    <div role="status" aria-label={`Loading ${variant} view`} className="space-y-6">
      <SkeletonHeader action={variant === "tanks"} />
      {variant === "activity" && <SkeletonPanel rows={6} />}
      {variant === "profile" && <ProfileSkeleton />}
      {variant === "alerts" && <AlertsSkeleton />}
      {variant === "tanks" && <TanksSkeleton />}
      {variant === "water" && <WaterSkeleton />}
      {variant === "feeding" && <OperationsSkeleton kind="feeding" />}
      {variant === "vision" && <OperationsSkeleton kind="vision" />}
      {variant === "biofloc" && <OperationsSkeleton kind="biofloc" />}
      {variant === "assistant" && <AssistantSkeleton />}
    </div>
  );
}

function SkeletonHeader({ action = false }: { action?: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--ep-line)] pb-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-8 w-60 max-w-full" />
        <SkeletonBlock className="h-4 w-72 max-w-full" />
      </div>
      {action && <SkeletonBlock className="h-11 w-32 rounded-xl" />}
    </div>
  );
}

function SkeletonPanel({ rows }: { rows: number }) {
  return (
    <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-sm">
      <SkeletonBlock className="h-6 w-44 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonBlock key={index} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function SkeletonKpis({ count }: { count: number }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${count === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="mt-4 h-8 w-28" />
          <SkeletonBlock className="mt-3 h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

function AlertsSkeleton() {
  return (
    <>
      <SkeletonKpis count={3} />
      <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm">
        <SkeletonBlock className="h-5 w-44" />
        <SkeletonBlock className="mt-3 h-4 w-72 max-w-full" />
        <SkeletonBlock className="mt-5 h-11 w-full max-w-sm rounded-xl" />
      </div>
      <SkeletonPanel rows={5} />
    </>
  );
}

function TanksSkeleton() {
  return (
    <>
      <SkeletonKpis count={3} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-11 w-11 rounded-xl" />
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              </div>
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--ep-line)]">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="space-y-1">
                  <SkeletonBlock className="h-3 w-14" />
                  <SkeletonBlock className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function WaterSkeleton() {
  return (
    <>
      <SkeletonKpis count={4} />
      <div className="flex gap-2 overflow-hidden border-b border-[var(--ep-line)] pb-3">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-10 w-28 shrink-0 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-sm">
          <SkeletonBlock className="h-6 w-48 mb-6" />
          <SkeletonBlock className="h-64 w-full rounded-xl" />
        </div>
        <SkeletonPanel rows={4} />
      </div>
    </>
  );
}

function OperationsSkeleton({ kind }: { kind: "feeding" | "vision" | "biofloc" }) {
  const isVision = kind === "vision";
  const isBiofloc = kind === "biofloc";
  return (
    <>
      <SkeletonKpis count={4} />
      <div className="grid gap-4 lg:grid-cols-2">
        {isVision ? (
          <>
            <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-sm">
              <SkeletonBlock className="h-6 w-48 mb-6" />
              <SkeletonBlock className="h-56 w-full rounded-xl" />
            </div>
            <SkeletonPanel rows={4} />
          </>
        ) : (
          <>
            <SkeletonPanel rows={isBiofloc ? 4 : 5} />
            <SkeletonPanel rows={isBiofloc ? 5 : 4} />
          </>
        )}
      </div>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-[640px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 sm:p-8 shadow-sm space-y-4">
      <SkeletonBlock className="h-3 w-32" />
      <SkeletonBlock className="h-7 w-48" />
      <SkeletonBlock className="h-4 w-72 max-w-full" />
      <SkeletonBlock className="h-11 w-full rounded-xl mt-6" />
      <SkeletonBlock className="h-11 w-full rounded-xl" />
      <SkeletonBlock className="h-11 w-28 rounded-xl ml-auto mt-4" />
    </div>
  );
}

function AssistantSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonBlock key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-sm space-y-4">
        <SkeletonBlock className="h-20 w-3/4 rounded-xl" />
        <SkeletonBlock className="h-16 w-1/2 rounded-xl ml-auto" />
        <SkeletonBlock className="h-24 w-4/5 rounded-xl" />
        <SkeletonBlock className="h-12 w-full rounded-xl mt-6" />
      </div>
    </div>
  );
}

export function DashboardLoadingState({ label = "Loading dashboard data…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      <DashboardSkeleton />
    </div>
  );
}

export function DashboardErrorState({ title, description, action }: StateMessageProps) {
  return (
    <div role="alert" className="dashboard-state-message rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-center sm:p-8 shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 mb-3">
        <Icon name="alert-circle" size={24} />
      </div>
      <h2 className="text-base font-semibold text-[var(--ep-text)]">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ep-text-muted)] leading-relaxed">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 min-h-11 rounded-xl bg-[var(--ep-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function DashboardEmptyState({ title, description, action }: StateMessageProps) {
  return (
    <div role="status" className="dashboard-state-message rounded-2xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-center sm:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ep-tint)] text-[var(--ep-primary)] mb-3">
        <Icon name="search" size={22} />
      </div>
      <h2 className="text-base font-semibold text-[var(--ep-text)]">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ep-text-muted)] leading-relaxed">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 min-h-11 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-5 text-sm font-semibold text-[var(--ep-text)] transition hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function DashboardInlineEmptyState({ message }: { message: string }) {
  return (
    <p role="status" className="py-10 text-center text-[13px] text-[var(--ep-text-muted)]">
      {message}
    </p>
  );
}
