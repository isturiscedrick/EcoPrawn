import type { SensorReading, TankStatus, AlertItem } from "../types";

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
    title: "Automate Monitoring & Actuation",
    body: "A 24/7 submerged sensor array watches DO, pH, temperature, salinity, and water level, with AI alerting and automatic device actuation.",
  },
  {
    num: "02",
    title: "Optimize Precision Feeding",
    body: "AI-driven feeders dispense on schedule and by real-time biomass, cutting Feed Conversion Ratio and water fouling.",
  },
  {
    num: "03",
    title: "Computer Vision Growth Analytics",
    body: "An overhead/underwater camera network detects body growth, estimates biomass, and flags abnormal behavior — no net stress.",
  },
  {
    num: "04",
    title: "Maintain Biological Water Integrity",
    body: "A biofloc recirculation loop promotes beneficial bacteria that process nitrogenous waste and hold microbial balance.",
  },
  {
    num: "05",
    title: "Ecological Effluent Discharge",
    body: "An automated plumbing network diverts bio-rich wastewater to nearby mangrove/wetland ecosystems for carbon sequestration.",
  },
];

export const features = [
  {
    index: "01",
    title: "AIoT Automation & Control",
    points: [
      { bold: "Continuous telemetry —", body: "submerged multi-sensor probes transmit water metrics around the clock." },
      { bold: "Automated actuation —", body: "relay triggers power on aerators, pumps, or dosing the moment a threshold is breached." },
      { bold: "Remote dashboard —", body: "live tank status, trend graphs, and instant SMS/email alerts." },
    ],
  },
  {
    index: "02",
    title: "AI Vision & Smart Feeding",
    points: [
      { bold: "Non-invasive growth tracking —", body: "high-resolution feeds analyzed for body length and weight distribution." },
      { bold: "Demand-based auto-feeders —", body: "dispense exact feed mass to avoid overfeeding and ammonia spikes." },
    ],
  },
  {
    index: "03",
    title: "Advanced Water Quality & Biofloc Management",
    points: [
      { bold: "Biofloc recirculation —", body: "beneficial bacterial flocs convert toxic ammonia and nitrite into usable microbial protein." },
    ],
  },
  {
    index: "04",
    title: "Sustainable Effluent Management",
    points: [
      { bold: "Mangrove irrigation outlet —", body: "a controlled discharge line feeds nearby mangrove/wetland plots, boosting growth and nutrient cycling." },
    ],
  },
  {
    index: "05",
    title: "Predictive Analytics & Decision Support",
    points: [
      { bold: "Water quality forecasting —", body: "ML models trained on historical telemetry predict parameter dips hours before they hit critical thresholds." },
    ],
  },
];

export const inScope = [
  { title: "Hardware setup", body: "Indoor tanks, circular water recirculation pumps, aerators, automated feeders, and a central gateway hub." },
  { title: "Sensor network", body: "DO, pH, temperature, salinity, and level sensors wirelessly sending telemetry to an on-site server and cloud database." },
  { title: "AI & computer vision", body: "Models for visual growth assessment, biomass density estimation, and parameter-triggered device control." },
  { title: "Biofloc recirculation", body: "A treatment loop that minimizes external water exchange requirements." },
  { title: "Effluent routing", body: "Discharge plumbing designed to divert bio-rich wastewater to surrounding mangrove/wetland vegetation." },
];

export const outOfScope = [
  { title: "Offshore / open-ocean farming", body: "Built exclusively for controlled indoor facilities — no open-sea cages or unlined earthen ponds." },
  { title: "Full hatchery / breeding", body: "Covers the grow-out phase only, from post-larvae to market size. No broodstock genetics or spawning management." },
  { title: "Fully autonomous harvesting", body: "Harvesting, sorting, and post-harvest packaging still require manual labor and traditional machinery." },
  { title: "Edge computing dependency", body: "Vision inference and predictive ML run on a dedicated local edge server (e.g. Mini-PC) — onboard microcontrollers can't carry the load." },
];

export const visionMetrics = [
  { label: "Avg. Body Length", value: "11.4 cm" },
  { label: "Avg. Weight", value: "18.2 g" },
  { label: "Population Est.", value: "10,120" },
  { label: "Abnormal Behavior", value: "0 flagged" },
];
