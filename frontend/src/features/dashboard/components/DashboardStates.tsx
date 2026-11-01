interface StateMessageProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function SkeletonBlock({ className }: { className: string }) {
  return <div aria-hidden="true" className={`dashboard-skeleton-block animate-pulse rounded-xl ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--ep-line)] pb-7">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="h-9 w-56" />
          <SkeletonBlock className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-11 w-36 rounded-full" />
          <SkeletonBlock className="h-11 w-28 rounded-full" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="mt-4 h-9 w-24" />
            <SkeletonBlock className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6">
          <SkeletonBlock className="h-6 w-52" />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => <SkeletonBlock key={index} className="h-24" />)}
          </div>
          <SkeletonBlock className="mt-5 h-40 w-full" />
        </div>
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6">
          <SkeletonBlock className="h-6 w-40" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }, (_, index) => <SkeletonBlock key={index} className="h-12 w-full" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

type DashboardViewSkeletonVariant =
  | "alerts"
  | "activity"
  | "biofloc"
  | "feeding"
  | "profile"
  | "tanks"
  | "vision"
  | "water";

export function DashboardViewSkeleton({ variant = "water" }: { variant?: DashboardViewSkeletonVariant }) {
  return (
    <div role="status" aria-label={`Loading ${variant} view`} className="space-y-5">
      <SkeletonHeader action={variant === "tanks"} />
      {variant === "activity" && <SkeletonPanel rows={5} />}
      {variant === "profile" && <ProfileSkeleton />}
      {variant === "alerts" && <AlertsSkeleton />}
      {variant === "tanks" && <TanksSkeleton />}
      {variant === "water" && <WaterSkeleton />}
      {variant === "feeding" && <OperationsSkeleton kind="feeding" />}
      {variant === "vision" && <OperationsSkeleton kind="vision" />}
      {variant === "biofloc" && <OperationsSkeleton kind="biofloc" />}
    </div>
  );
}

function SkeletonHeader({ action = false }: { action?: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--ep-line)] pb-7">
      <div>
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="mt-4 h-9 w-64 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
      </div>
      {action && <SkeletonBlock className="h-11 w-28 rounded-full" />}
    </div>
  );
}

function SkeletonPanel({ rows }: { rows: number }) {
  return (
    <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6">
      <SkeletonBlock className="h-6 w-44" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: rows }, (_, index) => <SkeletonBlock key={index} className="h-14 w-full" />)}
      </div>
    </div>
  );
}

function SkeletonKpis({ count }: { count: number }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${count === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5">
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
      <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5">
        <SkeletonBlock className="h-5 w-44" />
        <SkeletonBlock className="mt-3 h-4 w-72 max-w-full" />
        <SkeletonBlock className="mt-5 h-11 w-full max-w-sm" />
      </div>
      <SkeletonPanel rows={5} />
    </>
  );
}

function TanksSkeleton() {
  return (
    <>
      <SkeletonKpis count={3} />
      <SkeletonPanel rows={4} />
    </>
  );
}

function WaterSkeleton() {
  return (
    <>
      <SkeletonKpis count={4} />
      <div className="flex gap-2 overflow-hidden border-b border-[var(--ep-line)] pb-3">
        {Array.from({ length: 4 }, (_, index) => <SkeletonBlock key={index} className="h-10 w-24 shrink-0 rounded-full" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="mt-6 h-56 w-full" />
        </div>
        <SkeletonPanel rows={3} />
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
            <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6">
              <SkeletonBlock className="h-6 w-48" />
              <SkeletonBlock className="mt-6 h-56 w-full" />
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
    <div className="max-w-[640px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 sm:p-8">
      <SkeletonBlock className="h-3 w-32" />
      <SkeletonBlock className="mt-4 h-7 w-48" />
      <SkeletonBlock className="mt-3 h-4 w-72 max-w-full" />
      <SkeletonBlock className="mt-7 h-11 w-full" />
      <SkeletonBlock className="mt-5 h-11 w-full" />
      <SkeletonBlock className="mt-7 ml-auto h-11 w-28" />
    </div>
  );
}

export function DashboardLoadingState({ label = "Loading dashboard data…" }: { label?: string }) {
  return <DashboardSkeleton />;
}

export function DashboardErrorState({ title, description, action }: StateMessageProps) {
  return (
    <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-8 text-center">
      <p className="text-base font-semibold text-[var(--ep-primary)]">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ep-text-muted)]">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 min-h-11 rounded-lg bg-[var(--ep-accent)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--ep-accent-hover)]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function DashboardEmptyState({ title, description, action }: StateMessageProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-surface)] p-8 text-center">
      <p className="text-base font-semibold text-[var(--ep-primary)]">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ep-text-muted)]">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 min-h-11 rounded-lg border border-[var(--ep-accent)] px-4 text-sm font-semibold text-[var(--ep-accent)] transition-colors hover:bg-[rgba(232,98,58,0.08)]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
