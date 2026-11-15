import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { objectives, features, inScope, outOfScope } from "@/content/site";

const moduleIcons = ["droplet", "gauge", "eye", "utensils", "leaf"] as const;

function DashboardAboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="border-b border-[var(--ep-line)] pb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ep-primary)]">Settings &amp; preferences</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ep-text)] sm:text-3xl">System information</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ep-text-muted)]">
          An overview of EcoPrawn, its connected modules, objectives, and system scope.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-primary)]"><Icon name="sprout" size={22} /></div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--ep-text-muted)]">Platform overview</p>
          <h2 className="text-xl font-semibold text-[var(--ep-text)]">EcoPrawn</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ep-text-muted)]">
            An AIoT-enabled indoor shrimp farming platform that brings water monitoring, precision feeding, growth observation, and farm operations into a connected workflow. It helps facility operators understand tank conditions and coordinate day-to-day activities.
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-sm sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--ep-text-muted)]">General objective</p>
          <p className="text-lg font-medium leading-8 text-[var(--ep-text)]">“An AIoT-enabled system for water monitoring, precision feeding, and healthier indoor shrimp farming.”</p>
        </article>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--ep-text)]">System modules</h2>
          <p className="mt-1 text-sm text-[var(--ep-text-muted)]">The main capabilities available across the platform.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <article key={feature.index} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-primary)]"><Icon name={moduleIcons[index] ?? "layers"} size={20} /></div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]">Module {String(index + 1).padStart(2, "0")}</p>
              <h3 className="font-semibold text-[var(--ep-text)]">{feature.title}</h3>
              <ul className="mt-3 space-y-2">
                {feature.points.map(point => <li key={point.bold} className="flex gap-2 text-sm leading-6 text-[var(--ep-text-muted)]"><span className="text-[var(--ep-primary)]">•</span><span><strong className="font-semibold text-[var(--ep-text)]">{point.bold}</strong> {point.body}</span></li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--ep-text)]">System objectives</h2>
          <p className="mt-1 text-sm text-[var(--ep-text-muted)]">The intended outcomes that guide the platform.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {objectives.map((objective) => (
            <article key={objective.num} className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5">
              <p className="mb-2 text-xs font-bold tracking-wider text-[var(--ep-primary)]">{objective.num}</p>
              <h3 className="font-semibold text-[var(--ep-text)]">{objective.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ep-text-muted)]">{objective.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-emerald-500/25 bg-[var(--ep-surface)] p-6">
          <h2 className="font-semibold text-[var(--ep-text)]">Included in the system</h2>
          <ul className="mt-4 space-y-3">{inScope.map(item => <li key={item.title} className="flex gap-3 text-sm leading-6 text-[var(--ep-text-muted)]"><Icon name="check-circle" size={17} className="mt-0.5 shrink-0 text-emerald-600" /><span><strong className="text-[var(--ep-text)]">{item.title}</strong><br />{item.body}</span></li>)}</ul>
        </article>
        <article className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6">
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
