// Team grid config. Each row is a 7-column grid; a member occupies a column
// (0-indexed `col`), optionally spanning `span` columns. Jack is the only
// multi-cell card (4 columns) and renders the wide "founder" layout via `bio`.

export interface TeamMember {
  name: string;
  role: string;
  image?: string; // /team/*.jpg — omit for a gray placeholder
  col: number; // 0-indexed start column (0–6)
  span?: number; // column span (default 1)
  bio?: string; // present ⇒ wide founder card (Jack)
}

export const TEAM_COLS = 7;
export const CELL_W = 138.699; // px per column = standard portrait width

const JACK_BIO = `Starting 2026, I have been to 15 hackathons in a row, won 7, and hosted 3 of them. I know exactly what a great hackathon looks like! I had organized Canada's largest AI hackathon for 1,200+ hackers, a smaller one with 100 hackers, and a case comp!  Creating SOON, I want this to the most memorable hackathon ever. We will create space where hackers can bond organically and show off their best abilities. We help companies' products go to market, enhance their branding, improve their product, and introduce them to the most talented builders in Canada.  I gave my team 2 months to plan this entire hackathon from scratch.`;

/**
 * Rows grouped to match the Figma vertical spacing: 12px gap between groups,
 * cards touch (no gap) within a group.
 */
export const TEAM_GROUPS: TeamMember[][][] = [
  [
    [{ name: "First Lastname", role: "Partnerships", col: 6 }],
    [
      { name: "First Lastname", role: "Partnerships", col: 0 },
      { name: "Ariah D'Souza", role: "Marketing", image: "/team/ariah.jpg", col: 3 },
      { name: "Phin Truong", role: "Director", image: "/team/phin.jpg", col: 5 },
    ],
  ],
  [
    [
      {
        name: "Jack Le",
        role: "Founder",
        image: "/team/jack.jpg",
        col: 1,
        span: 4,
        bio: JACK_BIO,
      },
      { name: "Saanvi Mogla", role: "Co-President", image: "/team/saanvi.jpg", col: 5 },
    ],
  ],
  [
    [
      { name: "Erin Manalo", role: "Design", image: "/team/erin.jpg", col: 0 },
      { name: "Sophie Shu", role: "Design, Tech", image: "/team/sophie.jpg", col: 1 },
      { name: "Natasha <?>", role: "Operations", image: "/team/natasha.jpg", col: 3 },
      { name: "Nikita <?>", role: "Logistics", image: "/team/nikita.jpg", col: 4 },
    ],
  ],
];
