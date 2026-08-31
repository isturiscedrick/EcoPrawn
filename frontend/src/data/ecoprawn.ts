import type { SensorReading, TankStatus, AlertItem } from "@/types";

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
