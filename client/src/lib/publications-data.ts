// ─── PUBLICATIONS ───────────────────────────────────────────────────────────
// Add entries here for each article, paper, or write-up you want listed on
// the About page. `link` should point to where it can be read (Medium, a
// journal page, GitHub, etc).
export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: string;
  link: string;
}

export const PUBLICATIONS: Publication[] = [
   {
 id: "PAC2025",
  title: "Decentralized Energy Management for African Industries: AI-Controlled TEG Systems with Sensor-Guided Relay Switching",
  venue: "Cairo, Egypt",
  year: "2024",
  link: "https://ieeexplore-custom.ieee.org/document/11289182",
  },
];
