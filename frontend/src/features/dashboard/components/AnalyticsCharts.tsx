import { useMemo, useState } from "react";
import type { GrowthHistoryPoint, WaterHistoryPoint } from "@/types/api";

const PALETTE = ["#D85A35", "#167C80", "#6D67B2", "#C18A27", "#39865B", "#B34E83"];
const number = (value: number, digits = 1) => value.toLocaleString(undefined, { maximumFractionDigits: digits });
const shortDate = (value: string) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const fullDate = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function DonutChart({ items, unit, emptyLabel = "No data available" }: {
  items: { label: string; value: number; color: string }[]; unit: string; emptyLabel?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const segments = items.filter(item => item.value > 0).map(item => {
    const start = cursor;
    cursor += total ? item.value / total * 100 : 0;
    return `${item.color} ${start}% ${cursor}%`;
  });
  if (!total) return <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-[var(--ep-line)] text-sm text-[var(--ep-text-muted)]">{emptyLabel}</div>;
  return <div className="flex flex-wrap items-center justify-center gap-7 py-2">
    <div className="relative h-44 w-44 shrink-0 rounded-full" role="img" aria-label={items.map(item => `${item.label}: ${number(item.value)} ${unit}`).join(", ")} style={{ background: `conic-gradient(${segments.join(", ")})` }}>
      <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-[var(--ep-surface)]">
        <strong className="ep-font-display text-2xl text-[var(--ep-text)]">{number(total, 0)}</strong>
        <span className="text-xs text-[var(--ep-text-muted)]">{unit} total</span>
      </div>
    </div>
    <div className="min-w-[150px] flex-1 space-y-3">
      {items.map(item => <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2 text-[var(--ep-text-muted)]"><i className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: item.color }} /><span className="truncate">{item.label}</span></span>
        <strong className="ep-font-mono shrink-0 text-xs text-[var(--ep-text)]">{number(item.value)} <span className="font-normal text-[var(--ep-text-muted)]">{unit}</span></strong>
      </div>)}
    </div>
  </div>;
}

type Range = "7" | "30" | "90" | "all";
const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "7", label: "7 days" }, { value: "30", label: "30 days" },
  { value: "90", label: "90 days" }, { value: "all", label: "All history" },
];
function RangeControl({ value, onChange }: { value: Range; onChange: (value: Range) => void }) {
  return <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-1" role="group" aria-label="Chart date range">
    {RANGE_OPTIONS.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}
      className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)] ${value === option.value ? "bg-[var(--ep-accent)] text-white shadow-sm" : "text-[var(--ep-text-muted)] hover:bg-[var(--ep-accent-tint)]"}`}>{option.label}</button>)}
  </div>;
}
function sinceRange<T extends { recordedAt: string }>(items: T[], range: Range) {
  if (range === "all" || !items.length) return items;
  const cutoff = Date.now() - Number(range) * 86400000;
  return items.filter(item => new Date(item.recordedAt).getTime() >= cutoff);
}

function ChartFrame({ children, labels }: { children: React.ReactNode; labels: string[] }) {
  return <div className="min-w-0">
    <svg viewBox="0 0 720 270" className="h-[260px] w-full overflow-visible" role="img" aria-label={labels.join("; ")}>
      {[40, 95, 150, 205].map(y => <line key={y} x1="54" x2="700" y1={y} y2={y} stroke="var(--ep-line)" strokeDasharray="4 6" />)}
      {children}
    </svg>
  </div>;
}

export function GrowthHistoryChart({ data }: { data: GrowthHistoryPoint[] }) {
  const [range, setRange] = useState<Range>("30");
  const [metric, setMetric] = useState<"bodyLength" | "weight" | "population">("bodyLength");
  const [tankId, setTankId] = useState("all");
  const [hovered, setHovered] = useState<number | null>(null);
  const filtered = useMemo(() => sinceRange(data, range).filter(point => tankId === "all" || point.tankId === tankId).sort((a,b) => Date.parse(a.recordedAt)-Date.parse(b.recordedAt)), [data, range, tankId]);
  const tanks = useMemo(() => Array.from(new Map(data.map(p => [p.tankId, p.tankName] as const)).entries()), [data]);
  const value = (p: GrowthHistoryPoint) => p[metric];
  const unit = metric === "bodyLength" ? "cm" : metric === "weight" ? "g" : "shrimp";
  const label = metric === "bodyLength" ? "Body length" : metric === "weight" ? "Average weight" : "Population";
  const max = Math.max(1, ...filtered.map(value)), min = Math.min(0, ...filtered.map(value)), span = max-min || 1;
  const coords = filtered.map((p,i) => ({ x: 54 + (filtered.length < 2 ? 323 : i/(filtered.length-1)*646), y: 205 - ((value(p)-min)/span)*165 }));
  const line = coords.map(p => `${p.x},${p.y}`).join(" ");
  const area = coords.length ? `54,205 ${line} ${coords[coords.length-1].x},205` : "";
  const latest = filtered.at(-1);
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        <select aria-label="Growth metric" value={metric} onChange={e => setMetric(e.target.value as typeof metric)} className="min-h-10 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-text)]"><option value="bodyLength">Body length (cm)</option><option value="weight">Average weight (g)</option><option value="population">Population</option></select>
        <select aria-label="Filter growth by tank" value={tankId} onChange={e => setTankId(e.target.value)} className="min-h-10 max-w-44 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-text)]"><option value="all">All tanks</option>{tanks.map(([id,name]) => <option key={id} value={id}>{name}</option>)}</select>
      </div>
      <RangeControl value={range} onChange={setRange} />
    </div>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="ep-font-display text-2xl font-semibold text-[var(--ep-text)]">{latest ? number(value(latest)) : "—"} <span className="text-sm font-medium text-[var(--ep-text-muted)]">{unit}</span></div><p className="text-xs text-[var(--ep-text-muted)]">Latest recorded {label.toLowerCase()}</p></div><span className="rounded-full bg-[var(--ep-accent-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--ep-primary)]">{filtered.length} scans in range</span></div>
    {filtered.length > 1 ? <ChartFrame labels={[`${label} history chart`, ...filtered.map(p => `${p.tankName}, ${fullDate(p.recordedAt)}: ${number(value(p))} ${unit}`)]}>
      <defs><linearGradient id="ep-growth-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ep-accent)" stopOpacity=".28"/><stop offset="100%" stopColor="var(--ep-accent)" stopOpacity="0"/></linearGradient></defs>
      {[max, (max+min)/2, min].map((v,i) => <text key={i} x="0" y={44+i*80} fill="var(--ep-text-muted)" fontSize="11">{number(v)}</text>)}
      <polygon points={area} fill="url(#ep-growth-area)"/><polyline points={line} fill="none" stroke="var(--ep-accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {coords.map((p,i) => <g key={filtered[i].tankId+filtered[i].recordedAt} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(i)}><circle cx={p.x} cy={p.y} r="12" fill="transparent" tabIndex={0} role="button" aria-label={`${filtered[i].tankName}: ${number(value(filtered[i]))} ${unit}, ${fullDate(filtered[i].recordedAt)}`}/><circle cx={p.x} cy={p.y} r={hovered===i?7:4.5} fill="var(--ep-surface)" stroke="var(--ep-accent)" strokeWidth="3" pointerEvents="none"/></g>)}
      {coords.filter((_,i)=>i===0||i===coords.length-1).map((p,i)=><text key={i} x={p.x} y="240" textAnchor={i?"end":"start"} fill="var(--ep-text-muted)" fontSize="11">{shortDate(filtered[i?filtered.length-1:0].recordedAt)}</text>)}
    </ChartFrame> : <div className="rounded-xl border border-dashed border-[var(--ep-line)] py-12 text-center text-sm text-[var(--ep-text-muted)]">Not enough scan history for this range. Record more vision scans to build a trend.</div>}
    {hovered !== null && filtered[hovered] && <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3 text-xs"><strong className="text-[var(--ep-text)]">{filtered[hovered].tankName}</strong><span className="ml-2 text-[var(--ep-text-muted)]">{fullDate(filtered[hovered].recordedAt)}</span><div className="mt-1 font-semibold text-[var(--ep-accent)]">{number(value(filtered[hovered]))} {unit}</div></div>}
    <p className="text-[11px] text-[var(--ep-text-muted)]">Each point represents an actual vision scan. No missing readings or dates are interpolated.</p>
  </div>;
}

const WATER_METRICS = {
  dissolvedOxygen: { label: "Dissolved oxygen", unit: "mg/L", color: "#168C83" },
  ph: { label: "pH", unit: "pH", color: "#8066B8" },
  temperature: { label: "Temperature", unit: "°C", color: "#D85A35" },
  salinity: { label: "Salinity", unit: "ppt", color: "#3680B9" },
  waterLevel: { label: "Water level", unit: "%", color: "#C18A27" },
} as const;

export function WaterHistoryChart({ data, tanks }: { data: WaterHistoryPoint[]; tanks: {id:string;name:string}[] }) {
  const [range,setRange] = useState<Range>("7");
  const [metric,setMetric] = useState<keyof typeof WATER_METRICS>("dissolvedOxygen");
  const [tankId,setTankId] = useState("all");
  const [hovered,setHovered] = useState<WaterHistoryPoint|null>(null);
  const config = WATER_METRICS[metric];
  const filtered = useMemo(()=>sinceRange(data,range).filter(p=>tankId==="all"||p.tankId===tankId).sort((a,b)=>Date.parse(a.recordedAt)-Date.parse(b.recordedAt)),[data,range,tankId]);
  const grouped = useMemo(()=>tanks.map((tank,index)=>({tank,index,points:filtered.filter(p=>p.tankId===tank.id)})).filter(g=>g.points.length),[tanks,filtered]);
  const values = filtered.map(p=>p[metric]);
  const min = Math.min(...values), max = Math.max(...values), span=max-min||1;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        <select aria-label="Water quality parameter" value={metric} onChange={e=>{setMetric(e.target.value as keyof typeof WATER_METRICS);setHovered(null);}} className="min-h-10 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-text)]">{Object.entries(WATER_METRICS).map(([key,item])=><option key={key} value={key}>{item.label} ({item.unit})</option>)}</select>
        <select aria-label="Filter water quality by tank" value={tankId} onChange={e=>setTankId(e.target.value)} className="min-h-10 max-w-44 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-text)]"><option value="all">All tanks</option>{tanks.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
      </div><RangeControl value={range} onChange={setRange}/>
    </div>
    {filtered.length>1 ? <>
      <div className="flex flex-wrap gap-x-4 gap-y-2">{grouped.map(g=><span key={g.tank.id} className="inline-flex items-center gap-2 text-xs text-[var(--ep-text-muted)]"><i className="h-2.5 w-2.5 rounded-full" style={{background:PALETTE[g.index%PALETTE.length]}}/>{g.tank.name}</span>)}</div>
      <ChartFrame labels={[`${config.label} readings by tank`,...filtered.map(p=>`${tanks.find(t=>t.id===p.tankId)?.name}: ${p[metric]} ${config.unit} at ${fullDate(p.recordedAt)}`)]}>
        {[max,(max+min)/2,min].map((v,i)=><text key={i} x="0" y={44+i*80} fill="var(--ep-text-muted)" fontSize="11">{number(v)}</text>)}
        {grouped.map(g=>{const pts=g.points.map(p=>({p,x:54+((Date.parse(p.recordedAt)-Date.parse(filtered[0].recordedAt))/Math.max(1,Date.parse(filtered[filtered.length-1].recordedAt)-Date.parse(filtered[0].recordedAt)))*646,y:205-((p[metric]-min)/span)*165}));return <g key={g.tank.id}><polyline points={pts.map(v=>`${v.x},${v.y}`).join(" ")} fill="none" stroke={PALETTE[g.index%PALETTE.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{pts.map(({p,x,y})=><circle key={p.recordedAt+p.tankId} cx={x} cy={y} r={hovered===p?7:4.5} fill="var(--ep-surface)" stroke={PALETTE[g.index%PALETTE.length]} strokeWidth="2.5" tabIndex={0} role="button" aria-label={`${g.tank.name}: ${number(p[metric])} ${config.unit}, ${fullDate(p.recordedAt)}`} onMouseEnter={()=>setHovered(p)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(p)}/>)}</g>})}
        <text x="54" y="240" fill="var(--ep-text-muted)" fontSize="11">{shortDate(filtered[0].recordedAt)}</text><text x="700" y="240" textAnchor="end" fill="var(--ep-text-muted)" fontSize="11">{shortDate(filtered[filtered.length-1].recordedAt)}</text>
      </ChartFrame>
      {hovered&&<div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3 text-xs"><strong className="text-[var(--ep-text)]">{tanks.find(t=>t.id===hovered.tankId)?.name}</strong><span className="ml-2 text-[var(--ep-text-muted)]">{fullDate(hovered.recordedAt)}</span><div className="mt-1 font-semibold" style={{color:config.color}}>{number(hovered[metric])} {config.unit}</div></div>}
    </>:<div className="rounded-xl border border-dashed border-[var(--ep-line)] py-12 text-center text-sm text-[var(--ep-text-muted)]">No timestamped sensor history in this range. New sensor readings will appear here automatically.</div>}
    <p className="text-[11px] text-[var(--ep-text-muted)]">Showing recorded sensor readings only. Values from different tanks are not averaged together.</p>
  </div>;
}

export function FeedingProgressChart({ tanks }: { tanks: {id:string;name:string;dispensedToday:number;targetToday:number}[] }) {
  const rows = tanks.filter(t=>t.targetToday>0||t.dispensedToday>0);
  if(!rows.length)return <div className="py-10 text-center text-sm text-[var(--ep-text-muted)]">No feed target or dispense data available.</div>;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--ep-text-muted)]"><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[var(--ep-accent)]"/>Dispensed</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[var(--ep-line)]"/>Remaining target</span></div>
    {rows.map(t=>{const pct=t.targetToday>0?Math.min(100,t.dispensedToday/t.targetToday*100):100;return <div key={t.id}><div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><strong className="truncate text-[var(--ep-text)]">{t.name}</strong><span className="ep-font-mono shrink-0 text-xs text-[var(--ep-text-muted)]">{number(t.dispensedToday)} / {number(t.targetToday)} kg</span></div><div className="flex h-3 overflow-hidden rounded-full bg-[var(--ep-line)]" role="img" aria-label={`${t.name}: ${number(t.dispensedToday)} of ${number(t.targetToday)} kilograms dispensed`}><div className="h-full rounded-full bg-[var(--ep-accent)] transition-[width] duration-500" style={{width:`${pct}%`}}/></div><div className="mt-1 text-right text-[10px] text-[var(--ep-text-muted)]">{t.targetToday>0?`${number(t.dispensedToday/t.targetToday*100,0)}% of target`:"No target set"}</div></div>})}
  </div>;
}
