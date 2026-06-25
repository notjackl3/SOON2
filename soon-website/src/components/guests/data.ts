// Editable graph config for the Guests & Sponsors section.
// Coordinates live in a fixed stage space (see STAGE_W/STAGE_H); the section
// scales the whole stage to fit. (x, y) is each card's PICTURE top-left.

export type Corner = "tl" | "tr" | "bl" | "br";

export interface Person {
  id: string;
  name: string;
  role: string;
  image: string;
  x: number; // picture top-left, stage px
  y: number;
  corners: Corner[]; // which corners show a square (requirement 1)
}

export type EdgeEnd =
  | { kind: "corner"; id: string; corner: Corner }
  | { kind: "edge"; x: number; y: number }; // static screen-edge anchor

export interface Edge {
  from: EdgeEnd;
  to: EdgeEnd;
}

/** Stage coordinate space. Wider than 1440 (Barry's connector reaches the left
 *  edge, Ryan overhangs the right) and taller than the cards for drift room. */
export const STAGE_W = 1456;
export const STAGE_H = 860; // cards bottom ~715 + drift headroom
export const PIC = 206; // picture size (square)

export const PEOPLE: Person[] = [
  {
    id: "barry",
    name: "Barry Hillier",
    role: "x7 exit, Founder at Auto Agentic AI, 30 years of experiences",
    image: "/guests/barry.png",
    x: 131,
    y: 450,
    corners: ["tr", "bl"],
  },
  {
    id: "robert",
    name: "Robert Ciborowski",
    role: "CEO at Chatforce, previous at Meta",
    image: "/guests/robert.png",
    x: 471,
    y: 451,
    corners: ["br", "bl"],
  },
  {
    id: "nikos",
    name: "Nikos Dritsakos",
    role: "x1 exit, S26 YC solo founder, previously at Composio",
    image: "/guests/nikos.png",
    x: 741,
    y: 242,
    corners: ["tr", "bl", "br"],
  },
  {
    id: "arhum",
    name: "Arhum Shahzad",
    role: "SWE at Google, previously at Amazon",
    image: "/guests/arhum.png",
    x: 967,
    y: 448,
    corners: ["tr", "tl"],
  },
  {
    id: "jen",
    name: "Jen Looper",
    role: "Director of Developer Relations at Cloudinary, previously at Microsoft and AWS",
    image: "/guests/jen.png",
    x: 1084,
    y: 30,
    corners: ["tl", "br"],
  },
  {
    id: "ryan",
    name: "Ryan Ning",
    role: "SWE at Uber, incoming Amazon, previously at Shopify and researcher at UofT",
    image: "/guests/ryan.png",
    x: 1234,
    y: 449,
    corners: ["tl", "bl", "br"],
  },
];

const c = (id: string, corner: Corner): EdgeEnd => ({ kind: "corner", id, corner });
const e = (x: number, y: number): EdgeEnd => ({ kind: "edge", x, y });

export const EDGES: Edge[] = [
  { from: c("nikos", "tr"), to: c("jen", "tl") },
  { from: c("robert", "br"), to: c("nikos", "bl") },
  { from: c("nikos", "br"), to: c("arhum", "tl") },
  { from: c("arhum", "tr"), to: c("ryan", "bl") },
  { from: c("barry", "tr"), to: c("robert", "bl") },
  { from: c("jen", "br"), to: c("ryan", "tl") },
  // Pinned to static screen-edge points (requirement 6):
  { from: c("barry", "bl"), to: e(0, 656) },
  { from: c("jen", "br"), to: e(STAGE_W, 236) },
  { from: c("ryan", "br"), to: e(STAGE_W, 680) },
];

/** Decorative background vectors (best-effort placement, stage px). */
export const BG_VECTORS = [
  { src: "/guests/vec-1.svg", x: 13, y: 451, w: 213, h: 151 },
  { src: "/guests/vec-2.svg", x: 488, y: 148, w: 186, h: 124 },
  { src: "/guests/vec-3.svg", x: 905, y: 55, w: 209, h: 219 },
  { src: "/guests/vec-union.svg", x: 1300, y: 300, w: 120, h: 90 },
];
