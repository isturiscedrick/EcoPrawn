import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Icon, IconChip } from "@/components/ui/Icon";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";

function SettingsPage() {
  const location = useLocation();
  // Start from a stable server/client value; sync the saved preference after mount.
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const syncTheme = () => setDarkMode(window.localStorage.getItem("ep-dashboard-theme") === "dark");
    syncTheme();
    window.addEventListener("ecoprawn-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("ecoprawn-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  function toggleTheme() {
    const next = !darkMode;
    window.localStorage.setItem("ep-dashboard-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.add("theme-transitioning");
    window.setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 480);
    setDarkMode(next);
    window.dispatchEvent(new Event("ecoprawn-theme-change"));
  }

  const settings = [
    {
      title: "Account",
      description: "Edit your profile.",
      icon: "user-round" as const,
      to: "/dashboard/profile" as const,
      action: "Manage account",
    },
    {
      title: "Configuration",
      description: "Connect ESP32 and assign a tank.",
      icon: "cpu" as const,
      to: "/dashboard/settings/configuration" as const,
      action: "Device settings",
    },
    {
      title: "About",
      description: "System information.",
      icon: "file-text" as const,
      to: "/dashboard/about" as const,
      action: "About EcoPrawn",
    },
  ];

  if (location.pathname === "/dashboard/settings/configuration") return <Outlet />;

  return (
    <div className="mx-auto w-full max-w-none">
      <DashboardPageHeader
        eyebrow="Preferences & account"
        title="Settings"
        description="Account, device, and display preferences."
      />

      <section aria-labelledby="settings-navigation-title">
        <div className="mb-3">
          <h2 id="settings-navigation-title" className="text-sm font-semibold text-[var(--ep-text)]">Settings & preferences</h2>
          <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Choose a setting.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {settings.map((item) => (
            <Link key={item.title} to={item.to} className="group flex min-h-40 items-start gap-4 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-accent)]/45 hover:shadow-lg hover:shadow-[var(--ep-accent)]/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] sm:p-6">
              <IconChip name={item.icon} tone="brand" size={20} className="!bg-[var(--ep-accent-tint)] !text-[var(--ep-accent)] ring-1 ring-inset ring-[var(--ep-accent)]/15 transition-colors group-hover:!bg-[var(--ep-accent)] group-hover:!text-[var(--ep-on-accent)]" />
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-[var(--ep-text)]">{item.title}</span>
                <span className="mt-1 block text-sm leading-6 text-[var(--ep-text-muted)]">{item.description}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--ep-accent)]">{item.action}<Icon name="arrow-up-right" size={14} /></span>
              </span>
            </Link>
          ))}
          <section className="flex min-h-40 items-start gap-4 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm transition-colors hover:border-[var(--ep-accent)]/45 sm:p-6">
            <IconChip name={darkMode ? "moon" : "sun"} tone="brand" size={20} className="!bg-[var(--ep-accent-tint)] !text-[var(--ep-accent)] ring-1 ring-inset ring-[var(--ep-accent)]/15" />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-[var(--ep-text)]">Theme</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--ep-text-muted)]">Choose light or dark mode.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-[var(--ep-text-muted)]">Currently {darkMode ? "Dark" : "Light"} mode</span>
                <button type="button" onClick={toggleTheme} aria-pressed={darkMode} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-accent)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-accent-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)]">
                  <Icon name={darkMode ? "sun" : "moon"} size={15} />Switch to {darkMode ? "light" : "dark"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});
