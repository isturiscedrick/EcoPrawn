import { useEffect, useRef, useState, type FormEvent } from "react";
import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { growthRequest, parseSessions, dataset, type Session, type Measurement, type Point } from "../lib/growth-api";

const field = "rounded-lg border border-[var(--sand-dim)] bg-white px-3 py-2 text-sm w-full";
const button = "rounded-lg bg-[var(--water-deep)] px-4 py-2 text-sm text-white disabled:opacity-50";
const secondary = "rounded-lg border border-[var(--sand-dim)] px-3 py-2 text-sm disabled:opacity-50";
const fmt = (v: number | null, unit: string) => v === null ? "Not available" : `${v.toFixed(2)} ${unit}`;
const when = (v: string) => new Date(v).toLocaleString();

function GrowthChart({ sessions }: { sessions: Session[] }) {
  const rows = sessions.filter(s => s.summary.sampleCount > 0 && s.summary.lengthMm !== null);
  if (rows.length < 2) return <p className="py-6 text-sm">Approve samples in at least two dated sessions to show growth.</p>;
  const times = rows.map(s => Date.parse(s.sampledAt));
  const values = rows.map(s => s.summary.lengthMm!);
  const start = Math.min(...times), end = Math.max(...times);
  const min = Math.min(...values), max = Math.max(...values);
  const points = rows.map((s, i) => [45 + (times[i] - start) / (end - start || 1) * 500, 150 - (values[i] - min) / (max - min || 1) * 115]);
  return <svg viewBox="0 0 600 205" role="img" aria-label="Sampled average body length over actual capture dates">
    <text x="5" y="20" fontSize="12" fill="currentColor">Length, mm</text>
    <text x="5" y="40" fontSize="12" fill="currentColor">{max.toFixed(1)}</text>
    <text x="5" y="150" fontSize="12" fill="currentColor">{min.toFixed(1)}</text>
    <polyline points={points.map(p => p.join(",")).join(" ")} fill="none" stroke="var(--coral)" strokeWidth="3" />
    {points.map((p, i) => <circle key={rows[i].id} cx={p[0]} cy={p[1]} r="5" fill="var(--coral)"><title>{when(rows[i].sampledAt)}: {fmt(values[i], "mm")}, {rows[i].summary.sampleCount} sampled shrimp</title></circle>)}
    <text x="45" y="185" fontSize="12" fill="currentColor">{new Date(start).toLocaleDateString()}</text>
    <text x="545" y="185" textAnchor="end" fontSize="12" fill="currentColor">{new Date(end).toLocaleDateString()}</text>
  </svg>;
}

function Review({ measurement: m, busy, save, remove }: { measurement: Measurement; busy: boolean; save: (body: unknown) => void; remove: () => void }) {
  const a = m.correction ?? m.original;
  const [path, setPath] = useState<Point[] | null>(m.correction?.path ?? null);
  const [editing, setEditing] = useState(false);
  const [manual, setManual] = useState(m.manualLengthMm?.toString() ?? "");
  const [weight, setWeight] = useState(m.measuredWeightG?.toString() ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const length = path && a.mmPerPixel ? path.slice(1).reduce((total, p, i) => total + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0) * a.mmPerPixel : a.lengthMm;
  const saveStatus = (status: string) => save({ id: m.id, status, path, manualLengthMm: manual === "" ? null : Number(manual), measuredWeightG: weight === "" ? null : Number(weight) });
  return <article className="space-y-3 rounded-xl border border-[var(--sand-dim)] p-4">
    <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">Specimen {m.specimenId}</h3><span className="text-sm">{m.status} · {when(m.capturedAt)}</span></div>
    <svg viewBox={`0 0 ${a.width} ${a.height}`} className={`w-full max-h-[440px] bg-black ${editing ? "cursor-crosshair" : ""}`} role="img" aria-label="Rectified shrimp image with coral outline and green measurement path"
      onClick={event => {
        if (!editing) return;
        const matrix = event.currentTarget.getScreenCTM(); if (!matrix) return;
        const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
        if (point.x >= 0 && point.x <= a.width && point.y >= 0 && point.y <= a.height) setPath(previous => [...(previous ?? []), [point.x, point.y]]);
      }}>
      <image href={`/api/growth?image=${encodeURIComponent(m.id)}`} width={a.width} height={a.height} />
      <polygon points={a.outline.map(p => p.join(",")).join(" ")} fill="none" stroke="#ff784f" strokeWidth={Math.max(2, a.width / 400)} />
      <polyline points={(path ?? a.path).map(p => p.join(",")).join(" ")} fill="none" stroke="#40ffab" strokeWidth={Math.max(2, a.width / 300)} />
      {(path ?? []).map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={a.width / 150} fill="#40ffab" />)}
    </svg>
    {a.reason && <p className="text-sm" role="status">{a.reason}</p>}
    <p className="text-sm">Length: {fmt(length, "mm")} · Estimated weight: {fmt(path ? null : a.weightG, "g")}</p>
    <p className="text-xs">Original automated length: {fmt(m.original.lengthMm, "mm")} · {a.algorithm} · {(a.latencyMs / 1000).toFixed(2)} s</p>
    <p className="text-xs">{path ? "Corrected paths are saved separately. Weight is unavailable until corrections are validated for weight estimation." : a.weightReason || `Weight model: ${a.modelVersion}`}</p>
    {m.original.status === "review" && <div className="flex flex-wrap gap-2">
      <button type="button" className={secondary} disabled={busy} onClick={() => { setEditing(true); setPath([]); }}>Redraw centerline</button>
      <button type="button" className={secondary} disabled={busy || !path?.length} onClick={() => setPath(p => p?.slice(0, -1) ?? [])}>Undo point</button>
      <button type="button" className={secondary} disabled={busy} onClick={() => { setEditing(false); setPath(null); }}>Use original path</button>
    </div>}
    {editing && <p className="text-sm">Click from rostrum tip along the body centerline to telson tip. Exclude antennae. Add at least two points, then save.</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Independent ruler length, mm<input className={field} type="number" min="0.001" max="10000" step="any" value={manual} onChange={e => setManual(e.target.value)} /></label>
      <label className="text-sm">Independent scale weight, g<input className={field} type="number" min="0.001" max="10000" step="any" value={weight} onChange={e => setWeight(e.target.value)} /></label>
    </div>
    <p className="text-xs">Enter actual ruler and scale readings. Do not copy predictions into these training labels.</p>
    <div className="flex flex-wrap gap-2">
      <button className={button} disabled={busy || m.original.status !== "review" || (path !== null && path.length < 2)} onClick={() => saveStatus("approved")}>Approve measurement</button>
      <button className={secondary} disabled={busy || (path !== null && path.length < 2)} onClick={() => saveStatus(m.original.status === "rejected" ? "rejected" : "review")}>Save labels / unapprove</button>
      {!confirmDelete ? <button className={secondary} disabled={busy} onClick={() => setConfirmDelete(true)}>Delete image</button> : <><button className={secondary} disabled={busy} onClick={remove}>Confirm permanent deletion</button><button className={secondary} onClick={() => setConfirmDelete(false)}>Cancel</button></>}
    </div>
  </article>;
}

export function VisionGrowth() {
  const { tanks } = useTanks();
  const [selectedTank, setTank] = useState("");
  const tankId = selectedTank || tanks[0]?.id || "";
  const [sessions, setSessions] = useState<Session[]>([]);
  const [batch, setBatch] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<{ enabled: boolean; reason?: string; weightG?: number; forecastDate?: string; modelVersion?: string; validationMaeG?: number }>({ enabled: false });
  const [revision, setRevision] = useState(0);
  const [calibration, setCalibration] = useState<unknown>(null);
  const [newBatch, setNewBatch] = useState("");
  const [stockedAt, setStockedAt] = useState("");
  const [specimenId, setSpecimenId] = useState("");
  const [capturedAt, setCapturedAt] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const filtered = sessions.filter(s => s.tankId === tankId && s.batch === batch);
  const session = filtered.find(s => s.id === sessionId) ?? filtered.at(-1);
  const approved = filtered.filter(s => s.summary.sampleCount > 0);
  const latest = approved.at(-1), previous = approved.at(-2);
  useEffect(() => { setSessions([]); setBatch(""); setSessionId(""); setConfirmed(false); }, [tankId]);
  useEffect(() => {
    if (!tankId) return;
    const controller = new AbortController(); setLoading(true);
    growthRequest("GET", undefined, `?tankId=${encodeURIComponent(tankId)}`, controller.signal)
      .then(result => { if (!controller.signal.aborted) { const rows = parseSessions(result); setSessions(rows); setBatch(b => rows.some(s => s.batch === b) ? b : rows.at(-1)?.batch ?? ""); setError(null); } })
      .catch(e => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [tankId, revision]);
  useEffect(() => {
    setForecast({ enabled: false });
    if (!tankId || !batch) return;
    const controller = new AbortController();
    growthRequest("GET", undefined, `?tankId=${encodeURIComponent(tankId)}&batch=${encodeURIComponent(batch)}`, controller.signal)
      .then(result => { if (!controller.signal.aborted && result?.forecast) setForecast(result.forecast); })
      .catch(() => { if (!controller.signal.aborted) setForecast({ enabled: false, reason: "Forecast service unavailable." }); });
    return () => controller.abort();
  }, [tankId, batch, revision]);
  async function action(method: string, body?: unknown, query = "") {
    setBusy(true); setError(null); setNotice("");
    try { const result = await growthRequest(method, body, query);
      if (result.session) { setBatch(result.session.batch); setSessionId(result.session.id); }
      setNotice(result.duplicate ? "This image is already recorded in this session." : "Saved."); setRevision(n => n + 1);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save"); } finally { setBusy(false); }
  }
  async function upload(event: FormEvent) {
    event.preventDefault(); const file = fileInput.current?.files?.[0]; if (!file || !session) return;
    if (file.size > 8 * 1024 * 1024 || !["image/jpeg", "image/png"].includes(file.type)) { setError("Choose a JPEG or PNG up to 8 MB."); return; }
    try {
      const image = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error()); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.readAsDataURL(file); });
      await action("POST", { action: "upload", sessionId: session.id, specimenId: specimenId.trim(), capturedAt: new Date(capturedAt).toISOString(), setupId: session.setupId, setupConfirmed: confirmed, image });
    } catch { setError("Unable to read image or capture time"); }
  }
  function exportData() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(dataset(sessions), null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "ecoprawn-growth-manifest.json"; link.click(); URL.revokeObjectURL(url);
  }
  const delta = latest && previous && latest.summary.lengthMm !== null && previous.summary.lengthMm !== null ? `${(latest.summary.lengthMm - previous.summary.lengthMm).toFixed(2)} mm since ${new Date(previous.sampledAt).toLocaleDateString()}` : "No earlier approved session";
  return <div className="space-y-5">
    <header><p className="ep-font-mono text-xs uppercase tracking-widest text-[var(--mangrove)]">Sampling-tray measurements</p><h1 className="ep-font-display text-3xl text-[var(--water-deep)]">Vision &amp; growth</h1><p className="mt-2 text-sm text-[var(--ep-text-muted)]">Photograph one shrimp, review its measurement, and track sampled growth. Weight estimates appear only after local model validation.</p></header>
    {error && <div role="alert" className="rounded-lg border border-[var(--coral)] p-3 text-sm">{error} <button className="underline" onClick={() => setRevision(n => n + 1)}>Retry loading</button></div>}
    {notice && <p role="status" className="text-sm">{notice}</p>}
    {!tanks.length ? <Panel title="Start sampling"><p>Add a tank before creating a sampling session.</p></Panel> : <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Tank<select className={field} value={tankId} disabled={busy} onChange={e => setTank(e.target.value)}>{tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label className="text-sm">Stocking batch<select className={field} value={batch} disabled={busy} onChange={e => { setBatch(e.target.value); setSessionId(""); }}>{!sessions.length && <option value="">No sessions yet</option>}{[...new Set(sessions.map(s => s.batch))].map(b => <option key={b}>{b}</option>)}</select></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3"><KpiCard label="Sampled average length" unit="" deltaTone="ok" value={fmt(latest?.summary.lengthMm ?? null, "mm")} delta={delta} /><KpiCard label="Estimated average weight" unit="" deltaTone="ok" value={fmt(latest?.summary.weightG ?? null, "g")} delta={`${latest?.summary.weightSampleCount ?? 0} specimens with validated estimates`} /><KpiCard label="Approved specimens" unit="" deltaTone="ok" value={latest ? String(latest.summary.sampleCount) : "Not available"} delta="Latest approved session; not tank population" /></div>
      <Panel title="Seven-day forecast">{forecast.enabled && typeof forecast.weightG === "number" ? <p className="text-sm">Predicted sampled average: {fmt(forecast.weightG, "g")} on {when(forecast.forecastDate!)}. Held-out mean absolute error: {fmt(forecast.validationMaeG ?? null, "g")}. Model: {forecast.modelVersion}. This forecast uses independently weighed session averages.</p> : <p className="text-sm">{forecast.reason || "Forecasts remain disabled until an independent experiment passes evaluation."}</p>}</Panel>
      <Panel title="Sampled growth history"><GrowthChart sessions={filtered} /><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr><th className="p-2">Sampled at</th><th>Specimens</th><th>Length</th><th>Estimated weight</th></tr></thead><tbody>{filtered.map(s => <tr key={s.id} className="border-t border-[var(--sand-dim)]"><td className="p-2">{when(s.sampledAt)}</td><td>{s.summary.sampleCount}</td><td>{fmt(s.summary.lengthMm, "mm")}</td><td>{fmt(s.summary.weightG, "g")}</td></tr>)}</tbody></table></div><p className="mt-3 text-xs">Forecasts are disabled until a separate forecasting experiment passes evaluation. Legacy/demo scans are excluded from this history.</p></Panel>
      <Panel title="New sampling session"><form className="grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void action("POST", { action: "session", tankId, batch: newBatch.trim(), stockedAt: new Date(stockedAt).toISOString(), sampledAt: new Date().toISOString(), calibration }); }}>
        <label className="text-sm">Stocking batch<input required maxLength={100} className={field} value={newBatch} onChange={e => setNewBatch(e.target.value)} placeholder="Batch identifier" /></label>
        <label className="text-sm">Stocking date<input required className={field} type="date" value={stockedAt} onChange={e => setStockedAt(e.target.value)} /></label>
        <label className="text-sm">Camera calibration JSON<input required type="file" accept=".json,application/json" className={field} onChange={async e => { setCalibration(null); const file = e.target.files?.[0]; if (!file) return; try { if (file.size > 32000) throw new Error(); setCalibration(JSON.parse(await file.text())); } catch { setError("Choose a valid calibration JSON file up to 32 KB."); } }} /></label>
        <div className="flex items-end"><button className={button} disabled={busy || !calibration}>Create session for today</button></div>
      </form><p className="mt-3 text-xs">Generate a profile using ai/calibrate.py. Start a new session whenever camera position, resolution, lighting or tray conditions change.</p></Panel>
      {session && <Panel title="Capture and review"><div className="space-y-4">
        <label className="block text-sm">Session<select className={field} value={session.id} disabled={busy} onChange={e => { setSessionId(e.target.value); setConfirmed(false); }}>{filtered.map(s => <option key={s.id} value={s.id}>{when(s.sampledAt)} · {s.setupId}{s.invalidatedAt ? " · setup invalidated" : ""}</option>)}</select></label>
        <form onSubmit={upload} className="space-y-3"><div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Specimen ID<input required className={field} value={specimenId} maxLength={100} onChange={e => setSpecimenId(e.target.value)} placeholder="Reuse ID for repeat photos of the same shrimp" /></label>
          <label className="text-sm">Captured at<input required type="datetime-local" className={field} value={capturedAt} onChange={e => setCapturedAt(e.target.value)} /></label>
          <label className="text-sm">Tray photo<input required ref={fileInput} type="file" accept="image/jpeg,image/png" className={field} /></label>
        </div><label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Camera setup {session.setupId} is unchanged. The scale marker and shrimp are on the calibrated plane.</label>
        <div className="flex flex-wrap gap-2"><button className={button} disabled={busy || !!session.invalidatedAt}>{busy ? "Working…" : "Analyze image"}</button><button type="button" className={secondary} disabled={busy || !!session.invalidatedAt} onClick={() => void action("POST", { action: "invalidate", sessionId: session.id })}>Setup changed: invalidate session</button><button type="button" className={secondary} onClick={exportData}>Export tank dataset</button></div></form>
        {loading && <p role="status">Loading measurements…</p>}
        {!session.measurements.length && <button type="button" className={secondary} disabled={busy} onClick={() => void action("DELETE", undefined, `?sessionId=${encodeURIComponent(session.id)}`)}>Delete empty session</button>}
        {session.measurements.map(m => <Review key={`${m.id}-${m.status}-${m.manualLengthMm}-${m.measuredWeightG}-${JSON.stringify(m.correction)}`} measurement={m} busy={busy} save={body => void action("PATCH", body)} remove={() => void action("DELETE", undefined, `?id=${encodeURIComponent(m.id)}`)} />)}
      </div></Panel>}
    </>}
  </div>;
}
