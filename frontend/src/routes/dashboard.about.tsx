import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { KpiCard, KpiGrid, Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { objectives, features, inScope, outOfScope } from "@/content/site";

const moduleIcons = ["droplet", "gauge", "eye", "utensils", "leaf"] as const;

function DashboardAboutPage() {
  return (
    <div className="mx-auto w-full max-w-none">
      <DashboardPageHeader
        eyebrow="Settings"
        title="System information"
        description="Platform capabilities, goals, and scope."
        actions={<Link to="/dashboard/settings" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-primary)] hover:bg-[var(--ep-tint)]">
          <Icon name="arrow-left" size={14} /> Back to Settings
        </Link>}
      />

      <KpiGrid label="EcoPrawn platform summary">
        <KpiCard label="Platform" value="EcoPrawn" unit="AIoT" delta="Indoor shrimp farming" deltaTone="ok" icon="sprout" />
        <KpiCard label="Core modules" value={String(features.length)} unit="modules" delta="From hardware to effluent" deltaTone="ok" icon="layers" />
        <KpiCard label="Water sensors" value="5" unit="parameters" delta="DO, pH, temp, salinity, level" deltaTone="ok" icon="waves" />
        <KpiCard label="Growth tracking" value="Vision AI" unit="camera-based" delta="Non-invasive assessment" deltaTone="ok" icon="camera" />
      </KpiGrid>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Platform overview" icon="sprout">
          <p className="text-sm leading-6 text-[var(--ep-text-muted)]">
            EcoPrawn combines water monitoring, feeding, growth tracking, and farm operations for indoor shrimp production.
          </p>
        </Panel>
        <Panel title="General objective" icon="chart-bars-trend">
          <p className="text-sm leading-6 text-[var(--ep-text-muted)]">
            Use connected monitoring and precision feeding to support healthier, more consistent farm operations.
          </p>
        </Panel>
      </div>

      <section className="mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--ep-text)]">System modules</h2>
          <p className="mt-1 text-sm text-[var(--ep-text-muted)]">The core capabilities behind the platform.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <article key={feature.index} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-primary)]"><Icon name={moduleIcons[index] ?? "layers"} size={20} /></div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]">Module {String(index + 1).padStart(2, "0")}</p>
              <h3 className="font-semibold text-[var(--ep-text)]">{feature.title}</h3>
              <ul className="mt-3 space-y-2">
                {feature.points.map(point => <li key={point.bold} className="flex gap-2 text-sm leading-6 text-[var(--ep-text-muted)]"><span className="text-[var(--ep-primary)]">•</span><span><strong className="font-semibold text-[var(--ep-text)]">{point.bold.replace(/ —$/, "")}</strong> {point.body}</span></li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--ep-text)]">System objectives</h2>
          <p className="mt-1 text-sm text-[var(--ep-text-muted)]">What EcoPrawn is designed to support.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {objectives.map((objective) => (
            <article key={objective.num} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm">
              <p className="mb-2 text-xs font-bold tracking-wider text-[var(--ep-primary)]">{objective.num}</p>
              <h3 className="font-semibold text-[var(--ep-text)]">{objective.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ep-text-muted)]">{objective.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold text-[var(--ep-text)]">Included in the system</h2>
          <ul className="mt-4 space-y-3">{inScope.map(item => <li key={item.title} className="flex gap-3 text-sm leading-6 text-[var(--ep-text-muted)]"><Icon name="check-circle" size={17} className="mt-0.5 shrink-0 text-emerald-600" /><span><strong className="text-[var(--ep-text)]">{item.title}</strong><br />{item.body}</span></li>)}</ul>
        </article>
        <article className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold text-[var(--ep-text)]">Outside the system scope</h2>
          <ul className="mt-4 space-y-3">{outOfScope.map(item => <li key={item.title} className="flex gap-3 text-sm leading-6 text-[var(--ep-text-muted)]"><Icon name="minus-circle" size={17} className="mt-0.5 shrink-0 text-[var(--ep-text-muted)]" /><span><strong className="text-[var(--ep-text)]">{item.title}</strong><br />{item.body}</span></li>)}</ul>
        </article>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/about")({
  component: DashboardAboutPage,
});
