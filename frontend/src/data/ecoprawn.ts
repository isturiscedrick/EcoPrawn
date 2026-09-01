import type { SensorReading, TankStatus, AlertItem, SensorStatus } from "@/types";

export const heroReadouts: SensorReading[] = [
  { label: "Dissolved O₂", value: "6.2", pct: 78, status: "ok" },
  { label: "pH", value: "7.9", pct: 66, status: "ok" },
  { label: "Temperature", value: "28.4", pct: 71, status: "ok" },
  { label: "Salinity", value: "15", pct: 60, status: "ok" },
  { label: "Water Level", value: "98", pct: 98, status: "ok" },
];

export const heroReadoutUnits: Record<string, string> = {
  "Dissolved O₂": "mg/L",
  pH: "pH",
  Temperature: "°C",
  Salinity: "ppt",
  "Water Level": "%",
};

export const sensorGauges: SensorReading[] = [
  { label: "Dissolved O₂", value: "6.2 mg/L", pct: 78, status: "ok" },
  { label: "pH", value: "7.9", pct: 66, status: "ok" },
  { label: "Temperature", value: "28.4 °C", pct: 71, status: "ok" },
  { label: "Salinity", value: "15 ppt", pct: 60, status: "ok" },
  { label: "Water Level", value: "98%", pct: 98, status: "ok" },
];

export const tanks: TankStatus[] = [
  { name: "Tank 1", pl: "PL-42", biomass: "31.2 kg", status: "ok" },
  { name: "Tank 2", pl: "PL-42", biomass: "29.8 kg", status: "ok" },
  { name: "Tank 3", pl: "PL-38", biomass: "26.4 kg", status: "ok" },
  { name: "Tank 4", pl: "PL-38", biomass: "27.1 kg", status: "warn" },
  { name: "Tank 5", pl: "PL-30", biomass: "19.6 kg", status: "ok" },
  { name: "Tank 6", pl: "PL-30", biomass: "20.3 kg", status: "ok" },
];

export const alerts: AlertItem[] = [
  {
    icon: "warn",
    title: "DO trending toward threshold",
    detail: "Tank 4 — dissolved O₂ forecast to dip below 4.5 mg/L in ~2h",
    time: "14m ago",
  },
  {
    icon: "info",
    title: "Aerator auto-activated",
    detail: "Tank 2 — DO dropped to 4.8 mg/L, relay triggered automatically",
    time: "1h ago",
  },
  {
    icon: "info",
    title: "Feed cycle completed",
    detail: "All tanks — scheduled 14:00 dispense, biomass-adjusted",
    time: "3h ago",
  },
];

export const objectives = [
  {
    num: "01",
    title: "Hardware & Software Integration",
    body: "Every sensor, actuator, and control board runs on a unified hardware and software stack purpose-built for the EcoPrawn facility.",
  },
  {
    num: "02",
    title: "Critical Water Quality Parameters",
    body: "Dissolved oxygen, pH, temperature, salinity, and water level are tracked continuously as the core indicators of tank health.",
  },
  {
    num: "03",
    title: "IoT Water Quality Monitoring",
    body: "A deployed sensor network collects and transmits real-time water quality data, giving operators continuous, remote visibility into every tank.",
  },
  {
    num: "04",
    title: "Automated Smart Feeding",
    body: "Feed is dispensed on schedule and adjusted automatically for available biomass, minimizing waste and manual intervention.",
  },
  {
    num: "05",
    title: "Computer Vision Growth Monitoring",
    body: "Shrimp growth is tracked, biomass is estimated, and abnormal behavior is flagged visually — without nets or handling that stress the animals.",
  },
  {
    num: "06",
    title: "Unified Operational Platform",
    body: "The water quality monitoring system, smart feeding mechanism, computer vision module, and web dashboard now operate together as one integrated aquaculture platform.",
  },
];

export const features = [
  {
    index: "01",
    title: "Hardware Setup",
    points: [
      { bold: "Indoor tank installation —", body: "circular water recirculation pumps, aerators, automated feeders, and a central gateway hub run as one connected physical system." },
    ],
  },
  {
    index: "02",
    title: "Sensor Network",
    points: [
      { bold: "Full water-quality coverage —", body: "dissolved oxygen, pH, temperature, salinity, and water level sensors stream telemetry to an on-site server and cloud database around the clock." },
    ],
  },
  {
    index: "03",
    title: "AI & Computer Vision System",
    points: [
      { bold: "Growth & biomass assessment —", body: "trained machine learning models estimate shrimp growth and biomass density directly from camera feeds, with no physical handling required." },
      { bold: "Parameter-triggered control —", body: "devices such as aerators activate automatically the instant a monitored parameter, like dissolved oxygen, crosses its threshold." },
    ],
  },
  {
    index: "04",
    title: "Biofloc and Effluent Management",
    points: [
      { bold: "Biofloc-based treatment —", body: "a biological water management process runs continuously alongside discharge plumbing for controlled routing of bio-rich wastewater." },
    ],
  },
  {
    index: "05",
    title: "Effluent Routing",
    points: [
      { bold: "Mangrove / wetland outlet —", body: "discharge plumbing routes bio-rich wastewater to the surrounding mangrove and wetland vegetation as part of normal operation." },
    ],
  },
];

export const inScope = [
  { title: "Hardware Setup", body: "Indoor tanks, circular water recirculation pumps, aerators, automated feeders, and a central gateway hub, installed and operating as a single system." },
  { title: "Sensor Network", body: "Water quality sensors for dissolved oxygen, pH, temperature, salinity, and water level, transmitting telemetry to an on-site server and cloud database." },
  { title: "AI & Computer Vision System", body: "Machine learning models for visual shrimp growth assessment, biomass density estimation, and parameter-triggered device control, such as automatically activating aerators when dissolved oxygen falls below the defined threshold." },
  { title: "Biofloc and Effluent Management", body: "A biofloc-based water management process integrated with a discharge plumbing system for controlled routing of bio-rich wastewater to designated mangrove or wetland vegetation." },
  { title: "Effluent Routing", body: "Discharge plumbing that diverts bio-rich wastewater to surrounding mangrove and wetland vegetation." },
];

export const outOfScope = [
  { title: "Offshore / Open-Ocean Farming", body: "The system is engineered exclusively for controlled indoor facilities and does not support open-sea cages or unlined outdoor earthen ponds." },
  { title: "Full Hatchery / Breeding Operations", body: "The system covers the grow-out phase, from post-larvae to market size, and does not include broodstock genetics or spawning management." },
  { title: "Off-Grid Energy Independence", body: "The system is not designed to operate independently of the electrical grid; backup power or grid connectivity remains necessary during periods of insufficient solar availability." },
  { title: "Fully Autonomous Harvesting", body: "Harvesting, sorting, and post-harvest packaging remain outside the system's automation scope and still require manual labor or conventional sorting equipment." },
];

export const visionMetrics = [
  { label: "Avg. Body Length", value: "11.4 cm" },
  { label: "Avg. Weight", value: "18.2 g" },
  { label: "Population Est.", value: "10,120" },
  { label: "Abnormal Behavior", value: "0 flagged" },
];

/* =========================================================
   WATER QUALITY PAGE
========================================================= */

export interface WaterQualityTankReading {
  tank: string;
  dissolvedOxygen: number;
  ph: number;
  temperature: number;
  salinity: number;
  waterLevel: number;
  status: SensorStatus;
}

export const waterQualityByTank: WaterQualityTankReading[] = [
  { tank: "Tank 1", dissolvedOxygen: 6.2, ph: 7.9, temperature: 28.4, salinity: 15, waterLevel: 98, status: "ok" },
  { tank: "Tank 2", dissolvedOxygen: 5.8, ph: 7.8, temperature: 28.6, salinity: 15, waterLevel: 97, status: "ok" },
  { tank: "Tank 3", dissolvedOxygen: 6.0, ph: 7.9, temperature: 28.2, salinity: 14, waterLevel: 96, status: "ok" },
  { tank: "Tank 4", dissolvedOxygen: 4.6, ph: 7.7, temperature: 29.1, salinity: 15, waterLevel: 95, status: "warn" },
  { tank: "Tank 5", dissolvedOxygen: 6.3, ph: 8.0, temperature: 28.0, salinity: 14, waterLevel: 98, status: "ok" },
  { tank: "Tank 6", dissolvedOxygen: 6.1, ph: 7.9, temperature: 28.3, salinity: 15, waterLevel: 97, status: "ok" },
];

export interface WaterQualityThreshold {
  label: string;
  range: string;
  current: string;
  status: SensorStatus;
}

export const waterQualityThresholds: WaterQualityThreshold[] = [
  { label: "Dissolved O₂", range: "≥ 4.5 mg/L", current: "6.0 mg/L avg", status: "ok" },
  { label: "pH", range: "7.5 – 8.5", current: "7.87 avg", status: "ok" },
  { label: "Temperature", range: "26 – 30 °C", current: "28.4 °C avg", status: "ok" },
  { label: "Salinity", range: "10 – 20 ppt", current: "14.7 ppt avg", status: "ok" },
  { label: "Water Level", range: "≥ 90%", current: "96.8% avg", status: "ok" },
];

/* =========================================================
   VISION & GROWTH PAGE
========================================================= */

export interface TankGrowthReading {
  tank: string;
  bodyLength: string;
  weight: string;
  population: string;
  abnormal: number;
}

export const growthByTank: TankGrowthReading[] = [
  { tank: "Tank 1", bodyLength: "11.6 cm", weight: "18.6 g", population: "1,720", abnormal: 0 },
  { tank: "Tank 2", bodyLength: "11.3 cm", weight: "17.9 g", population: "1,695", abnormal: 0 },
  { tank: "Tank 3", bodyLength: "10.8 cm", weight: "16.4 g", population: "1,610", abnormal: 0 },
  { tank: "Tank 4", bodyLength: "10.5 cm", weight: "15.8 g", population: "1,580", abnormal: 1 },
  { tank: "Tank 5", bodyLength: "9.4 cm", weight: "12.1 g", population: "1,780", abnormal: 0 },
  { tank: "Tank 6", bodyLength: "9.6 cm", weight: "12.6 g", population: "1,735", abnormal: 0 },
];

export const growthTrend: number[] = [10.2, 10.5, 10.7, 10.9, 11.0, 11.2, 11.4];

export const visionScanLog = [
  { time: "Today · 09:40", tank: "Tank 1", note: "Growth scan completed — no anomalies detected." },
  { time: "Today · 08:15", tank: "Tank 4", note: "1 shrimp flagged for reduced motility, isolated for observation." },
  { time: "Yesterday · 17:50", tank: "All tanks", note: "Full facility biomass recalculation completed." },
];

/* =========================================================
   FEEDING PAGE
========================================================= */

export interface FeedScheduleEntry {
  time: string;
  amount: string;
  status: "done" | "upcoming";
}

export const feedSchedule: FeedScheduleEntry[] = [
  { time: "06:00", amount: "1.8 kg", status: "done" },
  { time: "10:00", amount: "1.9 kg", status: "done" },
  { time: "14:00", amount: "1.9 kg", status: "done" },
  { time: "18:00", amount: "1.8 kg", status: "upcoming" },
];

export interface TankFeedAllocation {
  tank: string;
  dispensedToday: string;
  targetToday: string;
  fcr: string;
}

export const feedByTank: TankFeedAllocation[] = [
  { tank: "Tank 1", dispensedToday: "1.3 kg", targetToday: "1.5 kg", fcr: "1.35" },
  { tank: "Tank 2", dispensedToday: "1.2 kg", targetToday: "1.5 kg", fcr: "1.38" },
  { tank: "Tank 3", dispensedToday: "1.1 kg", targetToday: "1.3 kg", fcr: "1.40" },
  { tank: "Tank 4", dispensedToday: "1.1 kg", targetToday: "1.3 kg", fcr: "1.44" },
  { tank: "Tank 5", dispensedToday: "0.9 kg", targetToday: "1.1 kg", fcr: "1.32" },
  { tank: "Tank 6", dispensedToday: "0.9 kg", targetToday: "1.1 kg", fcr: "1.36" },
];

/* =========================================================
   BIOFLOC LOOP PAGE
========================================================= */

export interface BioflocMetric {
  label: string;
  value: string;
  unit: string;
  status: SensorStatus;
}

export const bioflocMetrics: BioflocMetric[] = [
  { label: "Floc Volume (FV)", value: "12.4", unit: "mL/L", status: "ok" },
  { label: "C:N Ratio", value: "14.8", unit: ":1", status: "ok" },
  { label: "Total Suspended Solids", value: "310", unit: "mg/L", status: "ok" },
  { label: "Alkalinity", value: "148", unit: "mg/L CaCO₃", status: "ok" },
];

export const effluentLog = [
  { time: "Today · 07:00", event: "Scheduled discharge cycle", detail: "Tank 4 blowdown routed to wetland outlet — 220 L." },
  { time: "Yesterday · 19:00", event: "Scheduled discharge cycle", detail: "Facility-wide blowdown routed to mangrove outlet — 640 L." },
  { time: "2 days ago", event: "Carbon dosing", detail: "Molasses dosed to Tanks 1–3 to correct C:N ratio." },
];

/* =========================================================
   ALERTS PAGE
========================================================= */

export const alertsLog: AlertItem[] = [
  {
    icon: "warn",
    title: "DO trending toward threshold",
    detail: "Tank 4 — dissolved O₂ forecast to dip below 4.5 mg/L in ~2h",
    time: "14m ago",
  },
  {
    icon: "info",
    title: "Aerator auto-activated",
    detail: "Tank 2 — DO dropped to 4.8 mg/L, relay triggered automatically",
    time: "1h ago",
  },
  {
    icon: "info",
    title: "Feed cycle completed",
    detail: "All tanks — scheduled 14:00 dispense, biomass-adjusted",
    time: "3h ago",
  },
  {
    icon: "info",
    title: "Vision scan completed",
    detail: "Tank 1 — growth scan finished, no anomalies detected",
    time: "5h ago",
  },
  {
    icon: "warn",
    title: "Abnormal behavior flagged",
    detail: "Tank 4 — 1 shrimp showing reduced motility, isolated for observation",
    time: "9h ago",
  },
  {
    icon: "info",
    title: "Scheduled effluent discharge",
    detail: "Tank 4 blowdown routed to wetland outlet — 220 L",
    time: "11h ago",
  },
  {
    icon: "info",
    title: "Carbon dosing applied",
    detail: "Tanks 1–3 — molasses dosed to correct C:N ratio",
    time: "1d ago",
  },
];