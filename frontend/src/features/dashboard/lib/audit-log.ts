export type AuditEntity = "User" | "Tank";
export interface AuditLogEntry {
  id: string;
  entity: AuditEntity;
  action: string;
  actor: string;
  target: string;
  details: string;
  time: string;
}

const STORAGE_KEY = "ecoprawn.audit-log.v1";

export function recordAuditEvent(event: Omit<AuditLogEntry, "id" | "actor" | "time">) {
  if (typeof window === "undefined") return;
  try {
    const actor = window.localStorage.getItem("ep-profile-name") || "Facility Operator";
    const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as AuditLogEntry[];
    const entry: AuditLogEntry = { ...event, id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, actor, time: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing].slice(0, 500)));
    window.dispatchEvent(new Event("ecoprawn:audit-updated"));
  } catch {
    // Activity history is best-effort when browser storage is unavailable.
  }
}

export function readAuditEvents(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is AuditLogEntry =>
      !!item && typeof item === "object" && typeof item.id === "string" &&
      (item.entity === "User" || item.entity === "Tank") && typeof item.action === "string" &&
      typeof item.actor === "string" && typeof item.target === "string" &&
      typeof item.details === "string" && typeof item.time === "string"
    ) : [];
  } catch {
    return [];
  }
}
