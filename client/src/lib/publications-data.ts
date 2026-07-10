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
  // {
  //   id: "example-slug",
  //   title: "Title of the publication",
  //   venue: "Where it was published",
  //   year: "2024",
  //   link: "https://example.com/article",
  // },
];
