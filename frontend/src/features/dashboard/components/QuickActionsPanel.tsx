import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";

const quickActions = [
  { to: "/dashboard/water", title: "Water quality", description: "View water readings.", icon: "waves" },
  { to: "/dashboard/feeding", title: "Feeding", description: "View feeding schedules.", icon: "utensils" },
  { to: "/dashboard/alerts", title: "View alerts", description: "Review active alerts.", icon: "bell-ring" },
] as const;

export function QuickActionsPanel() {
  return (
    <Panel title="Quick actions" icon="zap">
      <div className="space-y-2">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to} className="group flex items-center gap-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-accent-tint)] text-[var(--ep-primary)]"><Icon name={action.icon} size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--ep-text)]">{action.title}</span>
              <span className="mt-0.5 block text-xs text-[var(--ep-text-muted)]">{action.description}</span>
            </span>
            <Icon name="arrow-right" size={16} className="text-[var(--ep-text-muted)] transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </Panel>
  );
}
