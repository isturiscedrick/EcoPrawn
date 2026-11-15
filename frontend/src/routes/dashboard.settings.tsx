import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon, IconChip } from "@/components/ui/Icon";

function SettingsPage() {
  const [darkMode, setDarkMode] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem("ep-dashboard-theme") === "dark",
  );

  useEffect(() => {
    const syncTheme = () => setDarkMode(window.localStorage.getItem("ep-dashboard-theme") === "dark");
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
      description: "Update your facility operator profile and account details.",
      icon: "user-round" as const,
      to: "/dashboard/profile" as const,
      action: "Manage account",
    },
    {
      title: "Configuration",
      description: "Connect an ESP32 device, assign it to a tank, and view sensor readings.",
      icon: "cpu" as const,
      to: "/dashboard/tanks" as const,
      action: "Manage device connection",
    },
    {
      title: "About",
      description: "Learn more about EcoPrawn and the platform.",
      icon: "file-text" as const,
      to: "/dashboard/about" as const,
      action: "About EcoPrawn",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7">
      <header className="border-b border-[var(--ep-line)] pb-6">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ep-primary)]">Preferences & account</div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ep-text)] sm:text-3xl">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ep-text-muted)]">Manage your account, ESP32 tank connection, appearance, and EcoPrawn information from one place.</p>
      </header>

      <section aria-labelledby="settings-navigation-title">
        <div className="mb-3">
          <h2 id="settings-navigation-title" className="text-sm font-semibold text-[var(--ep-text)]">Settings & preferences</h2>
          <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Choose an area to manage.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {settings.map((item) => (
            <Link key={item.title} to={item.to} className="group flex min-h-36 items-start gap-4 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-primary)]/40 hover:shadow-lg hover:shadow-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]">
              <IconChip name={item.icon} tone="coral" size={20} />
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-[var(--ep-text)]">{item.title}</span>
                <span className="mt-1 block text-sm leading-6 text-[var(--ep-text-muted)]">{item.description}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--ep-primary)]">{item.action}<Icon name="arrow-up-right" size={14} /></span>
              </span>
            </Link>
          ))}
          <section className="flex min-h-36 items-start gap-4 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5">
            <IconChip name={darkMode ? "moon" : "sun"} tone="brand" size={20} />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-[var(--ep-text)]">Theme</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--ep-text-muted)]">Choose the appearance that is most comfortable for your workspace.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-[var(--ep-text-muted)]">Currently {darkMode ? "Dark" : "Light"} mode</span>
                <button type="button" onClick={toggleTheme} aria-pressed={darkMode} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]">
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
