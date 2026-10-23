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
    body: "A deployed sensor network collects and transmits real-time water quality data, giving operators continuous, remote visibility into the tank.",
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
  { title: "Hardware Setup", body: "Indoor tank, circular water recirculation pump, aerator, automated feeder, and a central gateway hub, installed and operating as a single system." },
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

