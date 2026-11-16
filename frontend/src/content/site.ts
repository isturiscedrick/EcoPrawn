export const objectives = [
  {
    num: "01",
    title: "Integrated Facility Controls",
    body: "Connect sensors, equipment, and software in one operating system.",
  },
  {
    num: "02",
    title: "Water Quality Oversight",
    body: "Track five core parameters against configured ranges.",
  },
  {
    num: "03",
    title: "Precision Feeding",
    body: "Align feeding schedules with available biomass.",
  },
  {
    num: "04",
    title: "Non-invasive Growth Assessment",
    body: "Estimate shrimp growth and biomass from camera observations.",
  },
  {
    num: "05",
    title: "Coordinated Production Management",
    body: "Bring monitoring, feeding, and water treatment into one workflow.",
  },
];

export const features = [
  {
    index: "01",
    title: "Hardware Setup",
    points: [
      { bold: "Indoor tank installation —", body: "a circular water recirculation pump, aerator, automated feeder, and a central gateway hub run as one connected physical system." },
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
  { title: "Hardware Setup", body: "Indoor tank, recirculation pump, aerator, feeder, and gateway hub." },
  { title: "Sensor Network", body: "Five sensors send water readings to the on-site server and cloud database." },
  { title: "AI & Computer Vision System", body: "Camera-based growth and biomass estimates, plus threshold-triggered device control." },
  { title: "Biofloc and Effluent Management", body: "Biofloc treatment with controlled wastewater discharge." },
  { title: "Effluent Routing", body: "Routes treated wastewater to designated mangrove and wetland areas." },
];

export const outOfScope = [
  { title: "Offshore / Open-Ocean Farming", body: "The system is engineered exclusively for controlled indoor facilities and does not support open-sea cages or unlined outdoor earthen ponds." },
  { title: "Full Hatchery / Breeding Operations", body: "The system covers the grow-out phase, from post-larvae to market size, and does not include broodstock genetics or spawning management." },
  { title: "Off-Grid Energy Independence", body: "The system is not designed to operate independently of the electrical grid; backup power or grid connectivity remains necessary during periods of insufficient solar availability." },
  { title: "Fully Autonomous Harvesting", body: "Harvesting, sorting, and post-harvest packaging remain outside the system's automation scope and still require manual labor or conventional sorting equipment." },
];

