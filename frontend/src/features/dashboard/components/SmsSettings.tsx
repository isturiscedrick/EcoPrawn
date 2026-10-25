"use client";

import { useEffect, useState } from "react";
import { Panel } from "./DashboardPrimitives";

type Settings = {
  smsPhone: string | null;
  smsEnabled: boolean;
  configured: boolean;
  nextAttemptAt: string | null;
  deliveries: { id: string; content: string; status: string; error: string | null; createdAt: string }[];
};

export function SmsSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [phone, setPhone] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(Date.now());
  const retrySeconds = settings?.nextAttemptAt ? Math.max(0, Math.ceil((Date.parse(settings.nextAttemptAt) - now) / 1000)) : 0;
  useEffect(() => {
    if (!settings?.nextAttemptAt) return;
    const until = Date.parse(settings.nextAttemptAt);
    if (until <= Date.now()) return;
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= until) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [settings?.nextAttemptAt]);

  async function load(signal?: AbortSignal) {
    const response = await fetch("/api/sms/settings", { cache: "no-store", signal });
    if (!response.ok) throw new Error("Could not load SMS settings. Reload to try again.");
    const data: Settings = await response.json();
    setSettings(data); setPhone(data.smsPhone ?? ""); setEnabled(data.smsEnabled); setNow(Date.now());
  }
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).catch((error) => {
      if (!controller.signal.aborted) { setFeedback(error.message); setFailed(true); }
    });
    return () => controller.abort();
  }, []);

  async function perform(test: boolean) {
    setBusy(true); setFeedback(""); setFailed(false);
    try {
      const response = await fetch(test ? "/api/sms/test" : "/api/sms/settings", {
        method: test ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        ...(!test ? { body: JSON.stringify({ smsPhone: phone, smsEnabled: enabled }) } : {}),
      });
      const data = await response.json();
      if (test) {
        // Failed attempts also have a delivery record and a server-enforced cooldown.
        await load().catch(() => {});
        if (data.retryAfterSeconds) setSettings((current) => current ? { ...current, nextAttemptAt: new Date(Date.now() + data.retryAfterSeconds * 1000).toISOString() } : current);
      }
      if (!response.ok) throw new Error(data.error ?? "SMS could not be confirmed. Check delivery history before trying again.");
      setFeedback(test ? `Test message ${data.status}. Refresh delivery status to check for updates.` : "SMS preferences saved.");
      if (!test) await load();
    } catch (error) { setFailed(true); setFeedback(error instanceof Error ? error.message : "Could not save SMS settings."); }
    finally { setBusy(false); }
  }

  const dirty = settings && (phone !== (settings.smsPhone ?? "") || enabled !== settings.smsEnabled);
  return <Panel title="SMS water-quality alerts" badge={settings?.smsEnabled ? "Enabled" : "Off"}>
    <p className="text-sm text-[var(--water-deep)] mb-4">Receive warnings for oxygen, pH, temperature, salinity and water level. Sending is limited to one message every five minutes across your tanks. Use a mobile number you own or have permission to notify.</p>
    {settings && !settings.configured && <p className="text-sm text-[var(--amber-text)] mb-4">SMS sending is waiting for provider setup. You can save your preferences now.</p>}
    {!settings && !feedback && <p role="status" className="text-sm">Loading SMS settings...</p>}
    {settings && <form onSubmit={(event) => { event.preventDefault(); void perform(false); }} className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-[var(--water-deep)]">Philippine mobile number
        <input type="tel" autoComplete="tel" maxLength={24} placeholder="09171234567" value={phone} disabled={busy} onChange={(event) => setPhone(event.target.value)} className="block mt-2 w-full sm:max-w-sm rounded-lg border border-[var(--sand-dim)] px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-[var(--mangrove)]" />
      </label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} disabled={busy} onChange={(event) => setEnabled(event.target.checked)} /> Send water-quality alerts to this number</label>
      <div className="flex flex-wrap gap-3">
        <button disabled={busy} type="submit" className="rounded-full px-4 py-2 text-sm bg-[var(--mangrove)] text-white disabled:opacity-50">{busy ? "Please wait..." : "Save preferences"}</button>
        <button type="button" disabled={busy || !settings.configured || !settings.smsEnabled || Boolean(dirty) || retrySeconds > 0} onClick={() => void perform(true)} className="rounded-full border border-[var(--sand-dim)] px-4 py-2 text-sm disabled:opacity-50">{retrySeconds > 0 ? `Try again in ${Math.floor(retrySeconds / 60)}:${String(retrySeconds % 60).padStart(2, "0")}` : "Send test SMS"}</button>
        <button type="button" disabled={busy || Boolean(dirty)} onClick={() => { setBusy(true); load().catch(() => { setFailed(true); setFeedback("Could not refresh delivery status."); }).finally(() => setBusy(false)); }} className="px-2 py-2 text-sm underline disabled:opacity-50">Refresh delivery status</button>
      </div>
      {dirty && <p className="text-sm">Save changes before sending a test. Test messages use the same five-minute sending limit.</p>}
      {retrySeconds > 0 && <p className="text-sm">The five-minute limit applies to every send attempt, including requests rejected by the provider.</p>}
    </form>}
    {feedback && <p role={failed ? "alert" : "status"} className={`text-sm mt-4 ${failed ? "text-[var(--coral)]" : "text-[var(--mangrove)]"}`}>{feedback}</p>}
    {settings && <div className="mt-5 border-t border-[var(--sand-dim)] pt-4">
      <h4 className="text-sm font-semibold mb-2">Recent messages</h4>
      {!settings.deliveries.length && <p className="text-sm">No SMS messages yet. Save your number and enable alerts to get started.</p>}
      <ul className="divide-y divide-[var(--sand-dim)]">{settings.deliveries.map((delivery) => <li key={delivery.id} className="py-3 text-sm break-words">
        <div className="flex flex-wrap justify-between gap-2 mb-1"><time dateTime={delivery.createdAt}>{new Date(delivery.createdAt).toLocaleString()}</time><span className="font-semibold">{delivery.status}</span></div>
        <p>{delivery.content}</p>{delivery.error && <p className="text-[var(--coral)] mt-1">{delivery.error}</p>}
      </li>)}</ul>
    </div>}
  </Panel>;
}
