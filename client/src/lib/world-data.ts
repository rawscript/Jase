// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const PROJECTS = [
  {
    id: "msitubora",
    name: "Msitubora",
    lat: -1.3,
    lng: 36.8,
    region: "Nairobi, Kenya",
    type: "Full-Stack + AI",
    year: "2023",
    stack: ["Blockchain", "IoT", "React", "TypeScript", "SatelliteAPI"],
    description:
      "Forest monitoring hub with satellite API integration and blockchain-verified conservation records. Tracks deforestation, carbon credits, and biodiversity metrics across East African forests.",
    impact: "Planetary conservation monitoring system",
    link: "https://msitubora.onrender.com/",
  },
  {
    id: "aurora",
    name: "Aurora Energy",
    lat: 51.5,
    lng: -0.12,
    region: "London, UK",
    type: "Full-Stack + AI",
    year: "2023",
    stack: ["Node.js", "ES6", "PostgreSQL", "React"],
    description:
      "Energy management grid for optimising consumption across distributed networks. Real-time analytics dashboard with predictive load balancing and renewable integration scoring.",
    impact: "Energy optimization across the grid",
    link: "https://auroraenergy.app/",
  },
  {
    id: "mailforge",
    name: "Mailforge AI",
    lat: 37.77,
    lng: -122.42,
    region: "San Francisco, USA",
    type: "Full-Stack + AI",
    year: "2024",
    stack: ["AI", "Machine Learning", "GenAI", "PostgreSQL", "React"],
    description:
      "Automated synthesis tool for generating structural presentations and transmissions. Leverages LLMs to transform raw notes into polished, on-brand communications at scale.",
    impact: "Rapid generation of structural presentations",
    link: "https://mailforge.studio/",
  },
  {
    id: "nestie",
    name: "Nestie",
    lat: -1.28,
    lng: 36.82,
    region: "Nairobi, Kenya",
    type: "Backend Engineering",
    year: "2022",
    stack: ["Node.js", "React", "Next.js", "Stripe"],
    description:
      "Modern real estate platform with advanced topological search and intelligent property matching. Streamlines habitat allocation with integrated payments and virtual tours.",
    impact: "Habitat allocation with advanced topological search",
    link: "https://nestie.in/",
  },
  {
    id: "geospatial",
    name: "Geo-Spatial Lab",
    lat: 52.52,
    lng: 13.4,
    region: "Berlin, Germany",
    type: "Data Engineering",
    year: "2023",
    stack: ["Satellite APIs", "GIS", "PostGIS", "Python", "GDAL"],
    description:
      "Satellite data processing and spatial analysis platform for environmental monitoring. Ingests and processes multi-spectral imagery to generate actionable geospatial intelligence.",
    impact: "Geo-spatial data engineering expertise",
    link: "https://github.com/rawscript",
  },
  {
    id: "cloudinfra",
    name: "Cloud Infrastructure",
    lat: -33.92,
    lng: 18.42,
    region: "Cape Town, South Africa",
    type: "Cloud Infrastructure",
    year: "2022",
    stack: ["AWS", "GCP", "Docker", "Kubernetes", "CI/CD"],
    description:
      "Multi-cloud deployment architecture and server management platform spanning East and South Africa. Enables zero-downtime deployments and auto-scaling across heterogeneous cloud providers.",
    impact: "Scalable structural deployment",
    link: "https://github.com/rawscript",
  },
];

// ─── COLOR MAP ────────────────────────────────────────────────────────────────
export function typeColor(type: string): string {
  const map: Record<string, string> = {
    "Cloud Infrastructure": "#D4500A",
    "Data Engineering": "#1A6B3C",
    "Full-Stack + AI": "#1A3F7A",
    "Backend Engineering": "#6B21A8",
  };
  return map[type] || "#555";
}

// ─── PROJECTION ───────────────────────────────────────────────────────────────
export function latLngToXY(
  lat: number,
  lng: number,
  vw = 1000,
  vh = 500
): { x: number; y: number } {
  const x = ((lng + 180) / 360) * vw;
  const y = ((90 - lat) / 180) * vh;
  return { x, y };
}

// ─── LAND PATHS ───────────────────────────────────────────────────────────────
export const LAND = [
  // North America
  {
    id: "na",
    d: "M88,62 L100,55 L118,52 L138,56 L162,58 L185,60 L210,64 L228,72 L242,84 L252,100 L258,118 L260,138 L256,158 L248,175 L238,192 L224,208 L210,222 L198,240 L188,258 L178,274 L168,288 L156,298 L144,296 L134,284 L124,268 L116,250 L108,232 L100,212 L94,192 L88,170 L82,148 L80,126 L80,104 L84,82 Z",
  },
  // Greenland
  {
    id: "gl",
    d: "M190,18 L212,12 L238,14 L258,22 L268,36 L262,50 L244,58 L220,58 L200,50 L188,36 Z",
  },
  // South America
  {
    id: "sa",
    d: "M196,292 L214,282 L232,280 L248,286 L260,300 L268,318 L274,340 L276,364 L274,390 L268,416 L256,440 L240,458 L224,468 L210,464 L198,450 L190,432 L184,410 L182,385 L184,358 L188,330 L192,308 Z",
  },
  // Europe
  {
    id: "eu",
    d: "M448,58 L462,52 L478,50 L496,52 L514,56 L528,66 L536,80 L534,96 L524,108 L510,116 L494,120 L476,118 L460,112 L448,100 L444,84 Z",
  },
  // Scandinavia
  {
    id: "sc",
    d: "M472,28 L484,24 L498,28 L508,42 L504,58 L490,62 L476,56 L468,42 Z",
  },
  // UK
  { id: "uk", d: "M448,68 L456,64 L464,68 L464,80 L456,86 L448,80 Z" },
  // Africa
  {
    id: "af",
    d: "M454,148 L472,138 L494,136 L514,142 L530,152 L542,168 L548,188 L550,210 L548,234 L542,258 L532,282 L518,308 L500,330 L482,346 L466,348 L452,336 L440,314 L434,288 L432,260 L434,232 L438,204 L444,178 L450,160 Z",
  },
  // Madagascar
  {
    id: "mg",
    d: "M564,260 L572,252 L578,262 L576,278 L568,284 L560,276 Z",
  },
  // Asia main
  {
    id: "as",
    d: "M540,52 L568,44 L600,40 L636,42 L670,48 L704,54 L736,62 L764,72 L788,84 L808,98 L820,114 L816,130 L800,144 L778,154 L752,162 L722,168 L690,172 L658,174 L626,172 L596,166 L568,156 L548,142 L536,126 L534,108 L536,86 Z",
  },
  // Indian subcontinent
  {
    id: "in",
    d: "M620,176 L642,172 L658,178 L668,196 L670,216 L662,236 L646,250 L630,254 L616,244 L608,224 L608,202 L614,186 Z",
  },
  // SE Asia
  {
    id: "sea",
    d: "M718,176 L748,172 L772,178 L786,192 L784,210 L768,222 L746,226 L724,218 L710,202 L712,186 Z",
  },
  // Japan
  { id: "jp", d: "M796,100 L808,94 L818,100 L816,114 L804,120 L794,112 Z" },
  // Korea
  { id: "kr", d: "M776,108 L784,104 L790,110 L788,120 L780,124 L772,118 Z" },
  // Australia
  {
    id: "au",
    d: "M734,306 L766,296 L802,298 L832,308 L850,326 L856,350 L850,376 L832,396 L808,406 L778,408 L750,398 L728,378 L718,352 L720,326 Z",
  },
  // New Zealand
  {
    id: "nz",
    d: "M874,370 L882,362 L888,372 L884,386 L874,390 L868,380 Z",
  },
  // Middle East
  {
    id: "me",
    d: "M546,140 L568,134 L590,136 L606,148 L608,164 L596,174 L574,176 L554,168 L542,156 Z",
  },
  // Central America
  {
    id: "ca",
    d: "M160,230 L174,224 L186,230 L190,244 L180,254 L166,254 L156,244 Z",
  },
];
