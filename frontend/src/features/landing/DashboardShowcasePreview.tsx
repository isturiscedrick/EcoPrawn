import { Icon, type IconName } from "@/components/ui/Icon";

/* Public sample data only. Keep this preview independent from TankProvider. */
const metrics: {
  icon: IconName;
  label: string;
  value: string;
  unit: string;
  detail: string;
  tone: "ok" | "warn";
}[] = [
  {
    icon: "tank-stack",
    label: "Active tanks",
    value: "6",
    unit: "tanks",
    detail: "5 nominal · 1 attention",
    tone: "warn",
  },
  {
    icon: "package",
    label: "Total biomass",
    value: "842.6",
    unit: "kg",
    detail: "68,400 prawns stocked",
    tone: "ok",
  },
  {
    icon: "waves",
    label: "Mean dissolved oxygen",
    value: "6.4",
    unit: "mg/L",
    detail: "Optimal · 5.5–7.5 mg/L",
    tone: "ok",
  },
  {
    icon: "thermometer",
    label: "Mean temperature",
    value: "28.2",
    unit: "°C",
    detail: "Nominal · 27–31 °C",
    tone: "ok",
  },
];

const navigation: { icon: IconName; label: string }[] = [
  { icon: "layout-grid", label: "Dashboard" },
  { icon: "tank-stack", label: "Tanks" },
  { icon: "waves", label: "Water quality" },
  { icon: "camera", label: "Vision" },
  { icon: "utensils", label: "Feeding" },
  { icon: "chart-bars-trend", label: "Analytics" },
];

const tanks = [
  {
    name: "Tank A1",
    batch: "PL-2408-A",
    status: "Healthy",
    connected: true,
    oxygen: "6.8",
    ph: "7.9",
    temperature: "28.1°",
    salinity: "16 ppt",
    level: "98%",
    biomass: "148.2 kg",
  },
  {
    name: "Tank A2",
    batch: "PL-2408-B",
    status: "Healthy",
    connected: true,
    oxygen: "6.5",
    ph: "7.8",
    temperature: "28.4°",
    salinity: "15 ppt",
    level: "96%",
    biomass: "142.7 kg",
  },
  {
    name: "Tank B1",
    batch: "PL-2407-A",
    status: "Needs attention",
    connected: false,
    oxygen: "4.9",
    ph: "7.6",
    temperature: "29.0°",
    salinity: "17 ppt",
    level: "91%",
    biomass: "136.4 kg",
  },
];

const activities = [
  { icon: "waves" as const, title: "Water reading · Tank A1", detail: "Oxygen recorded at 6.8 mg/L", time: "Today, 10:42 AM" },
  { icon: "camera" as const, title: "Growth scan · Tank A2", detail: "Sample scan added to growth history", time: "Today, 9:18 AM" },
];

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) {
  const statusClass = metric.tone === "warn"
    ? "bg-amber-500"
    : "bg-emerald-500";

  return (
    <article data-showcase-metric className="min-w-0 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 shadow-sm sm:p-4">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--ep-tint)] text-[var(--ep-accent)]">
          <Icon data-showcase-icon name={metric.icon} size={16} />
        </span>
        <span className="min-w-0 truncate text-[9px] font-semibold uppercase tracking-wide text-[var(--ep-text-muted)] sm:text-[10px]">
          {metric.label}
        </span>
      </div>
      <p data-showcase-value className="mt-3 truncate text-xl font-semibold tracking-tight text-[var(--ep-text)] tabular-nums sm:text-2xl">
        {metric.value}
        <span className="ml-1 text-[10px] font-medium text-[var(--ep-text-muted)]">
          {metric.unit}
        </span>
      </p>
      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-[9px] text-[var(--ep-text-muted)] sm:text-[10px]">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusClass}`} />
        <span className="truncate">{metric.detail}</span>
      </p>
    </article>
  );
}

export function DashboardShowcasePreview() {
  return (
    <div
      data-dashboard-showcase
      className="ep-cloudnexus-dashboard overflow-hidden"
      data-hero="monitor-panel"
      aria-label="EcoPrawn dashboard preview with example data"
    >
      <div className="ep-cloudnexus-windowbar">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--ep-accent)] text-[var(--ep-on-accent)]">
              <Icon data-showcase-icon name="waves" size={15} />
          </span>
          <span className="text-xs font-bold tracking-tight text-[var(--ep-text)]">EcoPrawn</span>
          <span className="ml-2 hidden text-[10px] text-[var(--ep-text-muted)] sm:inline">
            / Facility overview
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-2.5 py-1 text-[9px] font-semibold text-[var(--ep-text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Demo workspace
        </span>
      </div>

      <div className="ep-cloudnexus-dashboard-body flex min-w-0">
        <aside className="ep-cloudnexus-mini-sidebar hidden w-36 shrink-0 flex-col gap-1 p-3 sm:flex lg:w-40" aria-label="Sample dashboard navigation">
          {navigation.map((item, index) => (
            <div
              key={item.label}
              data-showcase-nav-item
              className={`flex min-h-9 items-center gap-2 rounded-lg px-2 text-[10px] font-medium ${
                index === 0 ? "ep-cloudnexus-mini-active" : ""
              }`}
            >
              <Icon data-showcase-icon name={item.icon} size={14} />
              <span className="truncate">{item.label}</span>
            </div>
          ))}
          <div className="mt-auto border-t border-[var(--ep-line)] pt-3 text-[9px] text-[var(--ep-text-muted)]">
            Facility overview
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-[var(--ep-line)] pb-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.14em] text-[var(--ep-accent)]">
                Facility overview
              </p>
              <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-[var(--ep-text)] sm:text-xl">
                Dashboard
              </h2>
              <p className="mt-0.5 text-[10px] text-[var(--ep-text-muted)] sm:text-xs">
                Live facility status and tank performance
              </p>
            </div>
            <span className="rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-2.5 py-1 text-[9px] font-semibold text-[var(--ep-text-muted)]">
              Example data
            </span>
          </div>

          <section aria-label="Example facility metrics" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
            {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
          </section>

          <section className="mt-3 overflow-hidden rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)]" aria-labelledby="preview-tanks-heading">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--ep-line)] px-3 py-2.5 sm:px-4">
              <div>
                <h3 id="preview-tanks-heading" className="text-xs font-semibold text-[var(--ep-text)] sm:text-sm">
                  Tank snapshot
                </h3>
                <p className="mt-0.5 text-[9px] text-[var(--ep-text-muted)]">
                  Water parameters and biomass by tank
                </p>
              </div>
              <span className="hidden rounded-full bg-[var(--ep-tint)] px-2.5 py-1 text-[9px] font-semibold text-[var(--ep-accent)] sm:inline-flex">
                6 tanks
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[690px] border-collapse text-left text-[9px] sm:text-[10px]">
                <thead className="bg-[var(--ep-bg)] text-[8px] font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">
                  <tr>
                    <th className="px-3 py-2">Tank</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">ESP32</th>
                    <th className="px-2 py-2">DO</th>
                    <th className="px-2 py-2">pH</th>
                    <th className="px-2 py-2">Temp</th>
                    <th className="px-2 py-2">Salinity</th>
                    <th className="px-2 py-2">Level</th>
                    <th className="px-3 py-2 text-right">Biomass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ep-line)] text-[var(--ep-text)]">
                  {tanks.map((tank) => (
                    <tr key={tank.name} data-showcase-row>
                      <td className="px-3 py-2 font-semibold">
                        {tank.name}
                        <span className="ml-1.5 font-normal text-[var(--ep-text-muted)]">{tank.batch}</span>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`rounded-full px-2 py-1 text-[8px] font-semibold ${tank.status === "Healthy" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                          {tank.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[var(--ep-text-muted)]">{tank.connected ? "Connected" : "Offline"}</td>
                      <td className="px-2 py-2 tabular-nums">{tank.oxygen}</td>
                      <td className="px-2 py-2 tabular-nums">{tank.ph}</td>
                      <td className="px-2 py-2 tabular-nums">{tank.temperature}</td>
                      <td className="px-2 py-2 tabular-nums">{tank.salinity}</td>
                      <td className="px-2 py-2 tabular-nums">{tank.level}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">{tank.biomass}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-[var(--ep-line)] px-3 py-2 text-[9px] text-[var(--ep-text-muted)]">
              Showing 3 of 6 example tanks
            </div>
          </section>

          <section className="mt-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3" aria-labelledby="preview-activity-heading">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 id="preview-activity-heading" className="text-xs font-semibold text-[var(--ep-text)]">
                Recent facility activity
              </h3>
              <span className="text-[9px] text-[var(--ep-text-muted)]">Example events</span>
            </div>
            <ol className="grid gap-2 sm:grid-cols-2">
              {activities.map((activity) => (
                <li key={activity.title} data-showcase-activity className="flex min-w-0 items-start gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--ep-tint)] text-[var(--ep-accent)]">
                    <Icon data-showcase-icon name={activity.icon} size={13} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-semibold text-[var(--ep-text)] sm:text-[10px]">
                      {activity.title}
                    </p>
                    <p className="truncate text-[9px] text-[var(--ep-text-muted)]">
                      {activity.detail} · {activity.time}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </main>
      </div>
    </div>
  );
}
