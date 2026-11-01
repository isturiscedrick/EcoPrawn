"use client";

import { useEffect, useState } from "react";

export function ProfileEditForm() {
  const [name, setName] = useState("Facility Operator");
  const [role, setRole] = useState("Facility operator");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(window.localStorage.getItem("ep-profile-name") ?? "Facility Operator");
    setRole(window.localStorage.getItem("ep-profile-role") ?? "Facility operator");
  }, []);

  function save() {
    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    if (!trimmedName || !trimmedRole) return;
    window.localStorage.setItem("ep-profile-name", trimmedName);
    window.localStorage.setItem("ep-profile-role", trimmedRole);
    setName(trimmedName);
    setRole(trimmedRole);
    setSaved(true);
  }

  return (
    <section className="max-w-[640px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-[var(--ep-primary)] shadow-[var(--shadow-sm)] sm:p-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ep-accent)]">Operator profile</p>
      <h2 className="ep-font-display text-2xl font-semibold">Edit your profile</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ep-text-muted)]">
        Update the name and role shown in your dashboard sidebar.
      </p>
      <div className="mt-6 grid gap-5">
        <label className="text-sm font-semibold">
          <span className="mb-1.5 block">Display name</span>
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
            }}
            className="min-h-11 w-full rounded-lg border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 text-base outline-none focus:border-[var(--ep-accent)]"
          />
        </label>
        <label className="text-sm font-semibold">
          <span className="mb-1.5 block">Role label</span>
          <input
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setSaved(false);
            }}
            className="min-h-11 w-full rounded-lg border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 text-base outline-none focus:border-[var(--ep-accent)]"
          />
        </label>
      </div>
      <div className="mt-7 flex items-center justify-between gap-3">
        {saved ? <p className="text-sm font-semibold text-[var(--mangrove-text)]" role="status">Profile saved.</p> : <span />}
        <button type="button" onClick={save} className="min-h-11 rounded-lg bg-[var(--ep-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--ep-accent-hover)]">
          Save profile
        </button>
      </div>
    </section>
  );
}
