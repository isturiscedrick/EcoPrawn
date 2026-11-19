import { useEffect, useState } from "react";
import { recordAuditEvent } from "@/features/dashboard/lib/audit-log";

export function ProfileEditForm() {
  const [name, setName] = useState("Facility Operator");
  const [role, setRole] = useState("Facility operator");
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(window.localStorage.getItem("ep-profile-name") ?? "Facility Operator");
    setRole(window.localStorage.getItem("ep-profile-role") ?? "Facility operator");
    setImage(window.localStorage.getItem("ep-profile-image"));
  }, []);

  function save() {
    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    if (!trimmedName || !trimmedRole) return;
    try {
      if (image) window.localStorage.setItem("ep-profile-image", image);
      else window.localStorage.removeItem("ep-profile-image");
      window.localStorage.setItem("ep-profile-name", trimmedName);
      window.localStorage.setItem("ep-profile-role", trimmedRole);
    } catch {
      setImageError("Could not save the photo. Try a smaller image.");
      return;
    }
    window.dispatchEvent(new Event("ecoprawn:profile-updated"));
    recordAuditEvent({ entity: "User", action: "Updated profile", target: trimmedName, details: `Updated display name and role to ${trimmedRole}.` });
    setName(trimmedName);
    setRole(trimmedRole);
    setSaved(true);
  }

  function selectImage(file?: File) {
    setImageError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Choose an image file.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setImageError("Choose an image smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        setSaved(false);
      }
    };
    reader.onerror = () => setImageError("This image could not be loaded.");
    reader.readAsDataURL(file);
  }

  return (
    <section className="max-w-[640px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-[var(--ep-primary)] shadow-[var(--shadow-sm)] sm:p-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ep-accent)]">Operator profile</p>
      <h2 className="ep-font-display text-2xl font-semibold">Edit your profile</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ep-text-muted)]">
        Update your name, role, and dashboard photo.
      </p>
      <div className="mt-6 grid gap-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--ep-line)] bg-[var(--ep-accent-tint)] text-lg font-bold text-[var(--ep-primary)]">
            {image ? <img src={image} alt="Profile preview" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase() || "U"}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-sm font-semibold text-[var(--ep-text)] hover:bg-[var(--ep-tint)]">
              Choose photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => selectImage(event.currentTarget.files?.[0])}
              />
            </label>
            {image && (
              <button
                type="button"
                onClick={() => { setImage(null); setSaved(false); }}
                className="min-h-10 rounded-lg px-3 text-sm font-semibold text-[var(--ep-text-muted)] hover:bg-[var(--ep-tint)] hover:text-[var(--ep-text)]"
              >
                Remove photo
              </button>
            )}
          </div>
          {imageError && <p className="w-full text-sm text-rose-600 dark:text-rose-300" role="alert">{imageError}</p>}
        </div>
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
        {saved ? <p className="text-sm font-semibold text-[var(--ep-status-success)]" role="status">Profile saved.</p> : <span />}
        <button type="button" onClick={save} className="min-h-11 rounded-lg bg-[var(--ep-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--ep-accent-hover)]">
          Save profile
        </button>
      </div>
    </section>
  );
}
