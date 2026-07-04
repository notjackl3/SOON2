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

const JACK_BIO = `Starting 2026, I have been to 15 hackathons in a row, won 7, and hosted 3 of them. I know exactly what a great hackathon looks like! I had organized Canada's largest AI hackathon for 1,200+ hackers, a smaller one with 100 hackers, and a case comp!  Creating SOON, I want this to the most memorable hackathon ever. We will create space where hackers can bond organically and show off their best abilities.`;

/**
 * Rows grouped to match the Figma vertical spacing: 12px gap between groups,
 * cards touch (no gap) within a group.
 */
export const TEAM_GROUPS: TeamMember[][][] = [
  [
    [{ name: "Nikita Nathania", role: "Logistics Lead", image: "/team/nikita.jpg", col: 6 }],
    [
      { name: "Ariah D'Souza", role: "Marketing Lead", image: "/team/ariah.jpg", col: 0 },
      { name: "Natasha Ejercito", role: "Operations Lead", image: "/team/natasha.jpg", col: 3 },
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
      { name: "Dorothy Zheng", role: "Operations", image: "/team/dorothy.jpg", col: 3 },
      { name: "Sohaila Ali", role: "Operations", image: "/team/sohaila.jpg", col: 4 },
    ],
    [{ name: "Mohammad Mashrur", role: "Operations", image: "/team/mohammad.jpg", col: 2 }]
  ],
];

// --- Mobile scatter layout --------------------------------------------------
// Cards are absolutely positioned (x, y) inside a 390×971 stage; the content
// group sits MOBILE_CONTENT_TOP below the top. Same members as desktop.

export interface MobileCard {
  name: string;
  role: string;
  image?: string;
  bio?: string;
}

export interface MobilePlacement {
  card: MobileCard;
  x: number;
  y: number;
}

export const MOBILE_STAGE_W = 390;
export const MOBILE_STAGE_H = 971;
export const MOBILE_CONTENT_TOP = 50;
/** who-we-are.svg slot (replaces the Figma's per-piece title). */
export const MOBILE_TITLE = { x: 131, y: 290, w: 259 };

export const MOBILE_JACK: MobilePlacement = {
  card: { name: "Jack Le", role: "Founder", image: "/team/jack.jpg", bio: JACK_BIO },
  x: 42,
  y: 0,
};

export const MOBILE_CARDS: MobilePlacement[] = [
  { card: { name: "Saanvi Mogla", role: "Co-President", image: "/team/saanvi.jpg" }, x: 207, y: 179.68 },
  { card: { name: "Phin Truong", role: "Director", image: "/team/phin.jpg" }, x: 303.33, y: 69 },
  { card: { name: "Ariah D'Souza", role: "Marketing", image: "/team/ariah.jpg" }, x: 0, y: 359 },
  { card: { name: "Erin Manalo", role: "Design", image: "/team/erin.jpg" }, x: 86, y: 470 },
  { card: { name: "Sophie Shu", role: "Design, Tech", image: "/team/sophie.jpg" }, x: 198, y: 470 },
  { card: { name: "Natasha Ejercito", role: "Operations", image: "/team/natasha.jpg" }, x: 135, y: 620 },
  { card: { name: "Nikita Nathania", role: "Logistics", image: "/team/nikita.jpg" }, x: 28, y: 692 },
  { card: { name: "Mohammad Mashrur", role: "Operations", image: "/team/mohammad.jpg" }, x: 190, y: 748 },
  { card: { name: "Dorothy Zheng", role: "Operations", image: "/team/dorothy.jpg" }, x: 293, y: 581 },
  { card: { name: "Sohaila Ali", role: "Operations", image: "/team/sohaila.jpg" }, x: 293, y: 691 },
];
