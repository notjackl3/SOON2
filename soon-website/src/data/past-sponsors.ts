// Editable config for the "Our past sponsors" map section (Figma node 412:11).
// Coordinates live in a fixed 1600×1200 stage space (see STAGE_W/STAGE_H); the
// section scales the whole stage to fit. (x, y, w, h) is each card's BORDER box
// (the corner "pin" squares straddle those corners). Areas are the green city
// highlights on the map; edges connect a card corner to an area.

import type { BoxCorner } from "@/components/ui/bounding-box";

export const STAGE_W = 1600;
export const STAGE_H = 1200;

export type SponsorKind = "logo" | "quote";

export interface Sponsor {
  id: string;
  city: string;
  logo: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: SponsorKind;
  /** Company website — makes the logo/card clickable. Omit to leave it static. */
  url?: string;
  /** quote-card only */
  quote?: string;
  author?: string;
}

export interface Area {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Edge {
  from: string; // sponsor id
  corner: BoxCorner; // which card corner the line leaves from
  area: string; // area id it connects to
}

// --- Standalone cards (rendered generically) --------------------------------
export const SPONSORS: Sponsor[] = [
  {
    id: "composio",
    city: "San Francisco",
    logo: "/past-sponsors/sponsor-companies/composio.png",
    url: "https://composio.dev/",
    x: 240,
    y: 757,
    w: 250,
    h: 188,
    kind: "quote",
    quote:
      "“TYSM 🙏 you guys did incredible and im so happy to have been able to witness the journey 🥹.”",
    author: "- Julia Fedorin (Content Creator and Podcaster @ Composio)",
  },
  { id: "althra", city: "Vancouver", logo: "/past-sponsors/sponsor-companies/althra.png", url: "https://althra.ca/", x: 397.41, y: 540.6, w: 128.46, h: 128.46, kind: "logo" },
  { id: "cloudinary", city: "San Jose", logo: "/past-sponsors/sponsor-companies/cloudinary.png", url: "https://cloudinary.com/", x: 627.86, y: 981.29, w: 128.46, h: 128.46, kind: "logo" },
  {
    id: "polarity",
    city: "Waterloo",
    logo: "/past-sponsors/sponsor-companies/polarity.png",
    url: "https://www.polarity.so/",
    x: 582,
    y: 230,
    w: 268,
    h: 178,
    kind: "quote",
    quote:
      "“Just wanted to say you killed it this weekend. So thankful that I got to be apart of that.”",
    author: "- Sammy Tourani\n(Head of Growth @ Polarity)",
  },
  { id: "backboard", city: "Ottawa", logo: "/past-sponsors/sponsor-companies/backboard.png", url: "https://backboard.io/", x: 968.21, y: 419.23, w: 224.92, h: 85.14, kind: "logo" },
  {
    id: "chatforce",
    city: "Toronto",
    logo: "/past-sponsors/sponsor-companies/chatforce.png",
    url: "https://chatforce.com/",
    x: 1088.21,
    y: 749.4,
    w: 292.41,
    h: 175,
    kind: "quote",
    quote:
      "“The hackers were startup engineers, multi-time hackathon winners, and some of the most impressive builders I’ve met.”",
    author: "- Robert Ciborowski (Chatforce CEO)",
  },
];

// --- Toronto cluster (aucctus + cystack share an edge; P shares a corner) ----
// aucctus|cystack render as a 2×1 BoundingGrid; P is a box that omits its shared
// bottom-left corner. The whole cluster shares ONE connector (see CLUSTER_EDGE).
type ClusterCell = { id: string; city: string; logo: string; url?: string; x: number; y: number; w: number; h: number };
export const CLUSTER: Record<"aucctus" | "cystack" | "polar", ClusterCell> = {
  aucctus: { id: "aucctus", city: "Toronto", logo: "/past-sponsors/sponsor-companies/aucctus.png", url: "https://aucctus.com/", x: 1171.63, y: 579.69, w: 128.46, h: 128.46 },
  cystack: { id: "cystack", city: "Toronto", logo: "/past-sponsors/sponsor-companies/cystack.png", url: "https://cystack.net/", x: 1300.09, y: 579.69, w: 128.46, h: 128.46 },
  polar: { id: "polar", city: "Toronto", logo: "/past-sponsors/sponsor-companies/polar.png", url: "https://www.pingram.io/", x: 1428.56, y: 450.87, w: 128.46, h: 128.46 },
};

export const AREAS: Area[] = [
  { id: "sf", x: 670.87, y: 691.3, w: 67.73, h: 55.63 },
  { id: "bc", x: 599.15, y: 528.9, w: 67.73, h: 55.63 },
  { id: "sj", x: 738.6, y: 728.15, w: 42.49, h: 34.9 },
  { id: "toronto", x: 987.05, y: 620.57, w: 64.48, h: 51.02 },
  { id: "waterloo", x: 926, y: 604, w: 49.53, h: 46.77 },
  { id: "ottawa", x: 1088.96, y: 590.68, w: 43.2, h: 34.18 },
];

// Card corner -> area. The Toronto cluster is one edge (from aucctus).
export const EDGES: Edge[] = [
  { from: "composio", corner: "tr", area: "sf" },
  { from: "althra", corner: "tr", area: "bc" },
  { from: "cloudinary", corner: "tr", area: "sj" },
  { from: "polarity", corner: "br", area: "waterloo" },
  { from: "backboard", corner: "br", area: "ottawa" },
  { from: "chatforce", corner: "tl", area: "toronto" },
  { from: "aucctus", corner: "bl", area: "toronto" },
];

/** Decorative background vectors (stage px). */
export const BG_VECTORS = [
  { src: "/past-sponsors/arc.svg", x: 144.49, y: 44.6, w: 554.41, h: 1085.83 },
  { src: "/past-sponsors/vector-top-left.svg", x: 431.75, y: -14.05, w: 106.4, h: 159.62 },
  { src: "/past-sponsors/vector-cluster-bottom-left.svg", x: 76.16, y: 959.3, w: 54.23, h: 214.22 },
];

/** All sponsors flattened (standalone + cluster) for the mobile grid. */
export const ALL_SPONSORS = [
  ...SPONSORS,
  { ...CLUSTER.aucctus, kind: "logo" as const },
  { ...CLUSTER.cystack, kind: "logo" as const },
  { ...CLUSTER.polar, kind: "logo" as const },
];
