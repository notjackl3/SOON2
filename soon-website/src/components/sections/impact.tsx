import Image from "next/image";
import type { CSSProperties } from "react";

import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";

/**
 * The credibility section. An asymmetric bento of impact stats (each counts up
 * on scroll-in and reveals a one-line sponsor benefit on hover), followed by the
 * logo wall of companies our hackers & judges have built at and the schools they
 * study at. Sits after Recap, before Guests.
 */

type Stat = {
  /** Numeric part that counts up (integer string). Omit for static values. */
  count?: string;
  /** Text shown instead of / around the count (e.g. "5:1", or the "%" after). */
  prefix?: string;
  suffix?: string;
  label: string;
  /** One-line sponsor takeaway, revealed on hover. */
  benefit: string;
  /** Grid placement classes (md+). */
  span: string;
  /** Bigger type for the hero cell. */
  hero?: boolean;
};

const STATS: Stat[] = [
  {
    count: "300",
    suffix: "K+",
    label: "Social views",
    benefit: "Your brand in front of every set of eyes on the weekend.",
    span: "md:col-span-2",
    hero: true,
  },
  {
    prefix: "2,000+",
    label: "Photos & videos",
    benefit: "A content library you keep and reuse long after.",
    span: "md:col-span-2",
  },
  {
    count: "17",
    label: "Projects in 36h",
    benefit: "Real, working software — not slideware.",
    span: "md:col-span-2",
  },
  {
    prefix: "5:1",
    label: "Applicants per spot",
    benefit: "250 applied, 50 got in — every builder is curated.",
    span: "",
  },
  {
    count: "70",
    suffix: "%",
    label: "Have interned",
    benefit: "Seasoned builders who've already shipped in industry.",
    span: "",
  },
  {
    count: "9",
    label: "Activities",
    benefit: "Boba drops, spicy ramen, campfire, pool tournament — moments your brand can own.",
    span: "md:col-span-2",
  },
  {
    count: "7",
    label: "Meals",
    benefit: "Dim sum, teriyaki, BBQ pulled pork — not a single pizza.",
    span: "",
  },
  {
    count: "2",
    label: "Shipped to prod",
    benefit: "Ideas that landed straight into a real company's codebase.",
    span: "",
  },
];

const LOGOS = [
  "amazon",
  "aws",
  "amd",
  "cohere",
  "ibm",
  "shopify",
  "uber",
  "nasdaq",
  "robinhood",
  "roblox",
  "capitalone",
  "wealthsimple",
];

// The tiles spell "HACKER / S FROM" across two full rows of the 6-col grid
// (a blank gap tile sits between the S and FROM — 11 letters + 1 gap = 12
// tiles, so the grid is completely filled). Hovering a tile flips it to
// reveal the logo.
const LOGO_LETTERS = ["H", "A", "C", "K", "E", "R", "S", "", "F", "R", "O", "M"];

/** Human-readable brand names for alt text. */
const LOGO_ALT: Record<string, string> = {
  amazon: "Amazon",
  aws: "AWS",
  amd: "AMD",
  cohere: "Cohere",
  ibm: "IBM",
  shopify: "Shopify",
  uber: "Uber",
  nasdaq: "Nasdaq",
  robinhood: "Robinhood",
  roblox: "Roblox",
  capitalone: "Capital One",
  wealthsimple: "Wealthsimple",
};

// School logos — drop the files at /logos/<slug>.png to populate the tiles.
const SCHOOLS = ["uoft", "waterloo", "queens"];
const SCHOOL_ALT: Record<string, string> = {
  uoft: "University of Toronto",
  waterloo: "University of Waterloo",
  queens: "Queen's University",
};

/** Seeded-random blocky bursts, generated offline. Each blob is a union of
 *  overlapping axis-aligned rectangles (same-winding subpaths) — a stepped,
 *  pixel-explosion silhouette. Drops with `r` render as squares; ones with
 *  `rx/ry/rot` render as slivers with `rot` snapped to the nearest 90°. */
type SplatDrop = { cx: number; cy: number; r?: number; rx?: number; ry?: number; rot?: number };
const SPLATS: { blob: string; drops: SplatDrop[] }[] = [
  {
    blob: "M 30 30 L 63 30 L 63 69 L 30 69 Z M 3 54 L 48 54 L 48 63 L 3 63 Z M 48 42 L 90 42 L 90 54 L 48 54 Z M 48 36 L 84 36 L 84 51 L 48 51 Z M 45 6 L 54 6 L 54 48 L 45 48 Z M 51 48 L 63 48 L 63 96 L 51 96 Z M 27 24 L 42 24 L 42 39 L 27 39 Z M 27 57 L 42 57 L 42 72 L 27 72 Z",
    drops: [
      { cx: 26.3, cy: 82.1, r: 3.3 },
      { cx: 94.6, cy: 59.8, r: 4.2 },
      { cx: 68.1, cy: -0.2, rx: 8.3, ry: 3.3, rot: 298 },
      { cx: -6.5, cy: 36, r: 4.1 },
      { cx: 70.5, cy: 2.8, r: 4.3 },
      { cx: -8.9, cy: 28.9, r: 1.4 },
      { cx: 19, cy: 92.7, r: 3 },
      { cx: 93, cy: 38.5, r: 3.9 },
      { cx: 10.5, cy: 3.7, r: 3.1 },
      { cx: 47.1, cy: 81.7, r: 1.5 },
    ],
  },
  {
    blob: "M 30 27 L 63 27 L 63 63 L 30 63 Z M 6 36 L 48 36 L 48 48 L 6 48 Z M 48 42 L 90 42 L 90 54 L 48 54 Z M 48 45 L 81 45 L 81 57 L 48 57 Z M 51 0 L 63 0 L 63 48 L 51 48 Z M 51 9 L 60 9 L 60 48 L 51 48 Z M 45 48 L 54 48 L 54 96 L 45 96 Z M 51 48 L 60 48 L 60 81 L 51 81 Z M 27 57 L 39 57 L 39 69 L 27 69 Z M 57 60 L 69 60 L 69 72 L 57 72 Z",
    drops: [
      { cx: 20.6, cy: -6.4, rx: 7.5, ry: 3, rot: 245 },
      { cx: 2.7, cy: 21.6, r: 3.7 },
      { cx: 35.3, cy: 81.6, rx: 2.9, ry: 1.1, rot: 105 },
      { cx: 22.3, cy: 15.2, r: 3.1 },
      { cx: 31.3, cy: 7.7, r: 1.9 },
      { cx: 4, cy: 31.9, r: 1.6 },
    ],
  },
  {
    blob: "M 27 33 L 66 33 L 66 66 L 27 66 Z M 9 39 L 48 39 L 48 51 L 9 51 Z M 48 33 L 93 33 L 93 42 L 48 42 Z M 30 0 L 45 0 L 45 48 L 30 48 Z M 42 48 L 54 48 L 54 90 L 42 90 Z M 54 48 L 63 48 L 63 87 L 54 87 Z M 60 27 L 72 27 L 72 39 L 60 39 Z M 21 54 L 39 54 L 39 72 L 21 72 Z",
    drops: [
      { cx: 14.1, cy: 55.1, rx: 6.2, ry: 2.5, rot: 173 },
      { cx: 9.1, cy: 85, r: 3.7 },
      { cx: 72.6, cy: 16.5, r: 2 },
      { cx: 102.8, cy: 18.6, r: 3.2 },
      { cx: 43.5, cy: 99.3, r: 2.3 },
      { cx: 44.8, cy: 91.3, r: 4.2 },
    ],
  },
  {
    blob: "M 30 30 L 63 30 L 63 60 L 30 60 Z M 0 48 L 48 48 L 48 57 L 0 57 Z M 6 33 L 48 33 L 48 42 L 6 42 Z M 48 39 L 78 39 L 78 54 L 48 54 Z M 48 48 L 84 48 L 84 60 L 48 60 Z M 42 18 L 57 18 L 57 48 L 42 48 Z M 48 15 L 57 15 L 57 48 L 48 48 Z M 48 48 L 63 48 L 63 87 L 48 87 Z M 42 48 L 54 48 L 54 99 L 42 99 Z M 54 27 L 69 27 L 69 42 L 54 42 Z M 54 54 L 69 54 L 69 69 L 54 69 Z",
    drops: [
      { cx: 64, cy: 18.2, rx: 6.3, ry: 2.5, rot: 295 },
      { cx: 42, cy: 11.4, r: 2.8 },
      { cx: 51.1, cy: -4.9, rx: 3.4, ry: 1.3, rot: 272 },
      { cx: 14.5, cy: 23.5, r: 3.6 },
      { cx: 16.2, cy: 98.1, rx: 6.4, ry: 2.6, rot: 125 },
      { cx: 34.8, cy: 84.9, rx: 5.1, ry: 2, rot: 112 },
      { cx: 27.4, cy: 96.2, r: 3.3 },
      { cx: 58.8, cy: -0.7, rx: 4.1, ry: 1.6, rot: 281 },
      { cx: 93.3, cy: 43.9, rx: 4.6, ry: 1.8, rot: 351 },
    ],
  },
];

function StatCard({ stat, delay }: { stat: Stat; delay: number }) {
  const numClass = stat.hero
    ? "text-[clamp(56px,8.5vw,110px)]"
    : "text-[clamp(48px,7vw,92px)]";
  // cycle splat variants and mirror alternating cards so no two neighbours match
  const index = delay / 70;
  const splat = SPLATS[index % SPLATS.length];
  const flip = index % 2 === 1;
  return (
    <Reveal
      delay={delay}
      className={`group relative overflow-hidden border border-line bg-white transition-[border-color] duration-300 ease-out hover:border-ink/30 ${stat.span}`}
    >
      {/* hover lifts the content, not the card — the hover target must never
          move or resize, or the cursor at a card edge flips in/out of hover
          and the cards jitter. */}
      <div className="relative flex h-full flex-col justify-between p-5 transition-transform duration-300 ease-out group-hover:-translate-y-1 md:p-6">
        <span
          className={`relative block w-fit font-display leading-[0.82] tracking-tight text-ink ${numClass}`}
        >
          {/* blocky burst splash — centered on the numeral's glyphs (top 55% offsets
              the descender overflow of the 0.82 leading) and sized by the
              number in em units, with a floor so single digits still get a
              real splat. Burst and drops are animated on HTML wrappers, not
              SVG nodes — SVG transforms skip GPU compositing and stutter.
              Entry springs the scale; exit fades in place (transform resets
              only after the 700ms fade). */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[55%] h-[2em] w-[max(150%,2.4em)] -translate-x-1/2 -translate-y-1/2 text-accent"
          >
            <span className="absolute inset-0 scale-0 opacity-0 will-change-[scale,opacity] [transition:opacity_700ms_ease-out,scale_0s_700ms] group-hover:scale-100 group-hover:opacity-100 group-hover:[transition:scale_500ms_cubic-bezier(0.3,1.36,0.4,1)] pointer-coarse:scale-100 pointer-coarse:opacity-100">
              <svg
                viewBox="-12 -12 124 124"
                preserveAspectRatio="none"
                className={`h-full w-full ${flip ? "-scale-x-100" : ""}`}
              >
                <path d={splat.blob} fill="currentColor" />
              </svg>
            </span>
            <span className="absolute inset-0 scale-0 opacity-0 will-change-[scale,opacity] [transition:opacity_700ms_ease-out,scale_0s_700ms] group-hover:scale-100 group-hover:opacity-100 group-hover:[transition:scale_300ms_ease-out_100ms,opacity_0s_100ms] pointer-coarse:scale-100 pointer-coarse:opacity-100">
              <svg
                viewBox="-12 -12 124 124"
                preserveAspectRatio="none"
                className={`h-full w-full ${flip ? "-scale-x-100" : ""}`}
              >
                <g fill="currentColor">
                  {splat.drops.map((d, j) =>
                    d.r != null ? (
                      // square droplet
                      <rect
                        key={j}
                        x={d.cx - d.r}
                        y={d.cy - d.r}
                        width={d.r * 2}
                        height={d.r * 2}
                      />
                    ) : (
                      // sliver: thin bar, rotation snapped to the nearest 90°
                      // so every edge in the splash stays axis-aligned
                      <rect
                        key={j}
                        x={d.cx - (d.rx ?? 0)}
                        y={d.cy - (d.ry ?? 0)}
                        width={(d.rx ?? 0) * 2}
                        height={(d.ry ?? 0) * 2}
                        transform={`rotate(${Math.round((d.rot ?? 0) / 90) * 90} ${d.cx} ${d.cy})`}
                      />
                    )
                  )}
                </g>
              </svg>
            </span>
          </span>
          <span className="relative">
            {stat.prefix}
            {stat.count ? <CountUp value={stat.count} delay={delay + 120} /> : null}
            {stat.suffix}
          </span>
        </span>

        <div className="mt-4 flex flex-col gap-1">
          <span className="text-sm uppercase tracking-body text-ink md:text-base">
            {stat.label}
          </span>
          {/* benefit line — space is always reserved (fade only) so hovering
              never changes the card's height. With auto-rows-fr, one growing
              card resizes every row and re-triggers hover in a loop. */}
          <span className="block text-sm leading-snug tracking-body text-muted opacity-0 transition-[opacity,color] duration-300 ease-out group-hover:text-ink group-hover:opacity-100">
            {stat.benefit}
          </span>
        </div>
      </div>
    </Reveal>
  );
}

export default function SectionImpact() {
  return (
    <section id="impact" className="relative w-full overflow-hidden bg-white py-20 md:py-28">
      <div className="relative mx-auto w-full max-w-360 px-8 md:px-34">
        {/* Bento of stats */}
        <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={i * 70} />
          ))}
        </div>

        {/* Letter wall — tiles spell PAST INTERNS; each flips split-flap style
            to reveal the company logo on hover. */}
        {/* mt-3 matches the bento's gap-3 gutters, so the letter wall sits the
            same distance below the stats as the stat cards sit from each other. */}
        <div className="mt-3">
          <h3 className="sr-only">Hackers from</h3>
          <div className="grid grid-cols-3 border-l border-t border-line sm:grid-cols-4 md:grid-cols-6">
            {LOGOS.map((slug, i) => (
              <Reveal
                key={slug}
                delay={i * 45}
                className="group border-b border-r border-line bg-white [perspective:800px]"
              >
                <div
                  className="tile-autoflip relative aspect-3/2 w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateX(180deg)]"
                  style={{ "--flip-delay": `${i * 0.45}s` } as CSSProperties}
                >
                  {/* front: the letter */}
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center font-display text-[clamp(40px,5vw,72px)] leading-none tracking-tight text-ink [backface-visibility:hidden]"
                  >
                    {LOGO_LETTERS[i]}
                  </span>
                  {/* back: the logo */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]">
                    <Image
                      src={`/logos/${slug}.png`}
                      alt={LOGO_ALT[slug]}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                      className="object-contain p-5 md:p-6"
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
