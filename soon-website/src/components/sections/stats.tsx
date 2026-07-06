import { type ReactNode } from "react";

import { BoundingBox } from "@/components/ui/bounding-box";
import { BoundingGrid } from "@/components/ui/bounding-grid";
import { Reveal } from "@/components/ui/reveal";
import { StatHighlight } from "@/components/ui/stat-highlight";

/**
 * "A glimpse at what we're capable of" — a grid of achievement stats followed by
 * the "Where our hackers HAVE BEEN" letter block. Each stat card and each letter
 * cell is a decorative <BoundingBox> (the red/blue placeholder frames in Figma).
 *
 * NOTE: the accent-green highlight + pixel-flicker cluster that sits behind the
 * "300K+" stat is intentionally omitted for now — see the follow-up discussion.
 */

type Stat = { value: string; label: ReactNode };

const ROW_ONE: Stat[] = [
  { value: "300K+", label: "Social Views" },
  { value: "70%", label: "Of Hackers Have Interned" },
  { value: "9", label: "Activities" },
  { value: "7", label: "Meals" },
];

const ROW_TWO: Stat[] = [
  { value: "17", label: "Projects in 36 Hours" },
  {
    value: "2",
    label: (
      <>
        Shipped
        <br />
        To Prod
      </>
    ),
  },
  {
    value: "5:1",
    label: (
      <>
        Applicants
        <br />
        Per Spot
      </>
    ),
  },
  { value: "2,000+", label: "Photos and Videos" },
];

/** H A V E / B E E N, laid out as a 4×2 grid of bounding-box cells. */
const LETTERS = ["H", "A", "V", "E", "B", "E", "E", "N"];

/** Big Playfair number stacked over an uppercase Inter label, framed by the box. */
function StatCard({ value, label }: Stat) {
  return (
    <BoundingBox cornerSize="lg" className="group flex h-31 flex-col justify-between p-3.5 sm:h-37.5 md:h-43 md:p-5">
      <span className="relative inline-block self-start font-display text-[clamp(38px,6.5vw,82px)] leading-[0.9] tracking-tight text-ink">
        <StatHighlight value={value} />
        <span className="relative z-10">{value}</span>
      </span>
      <span className="font-sans text-[11px] uppercase leading-tight tracking-tight text-ink-soft md:text-[16px]">
        {label}
      </span>
    </BoundingBox>
  );
}

export default function SectionStats() {
  return (
    <section
      id="stats"
      className="relative w-full bg-white py-16 md:py-24"
    >
      {/* Decorative cloud cluster — bleeds up past the top-right corner. */}
      <Reveal
        as="img"
        x={40}
        y={-20}
        duration={900}
        src="/stats/union-top.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -top-12 right-4 hidden w-[clamp(220px,26vw,440px)] md:right-16 lg:block"
      />

      {/* Dashed swoosh (three arc segments) sweeping around the letter block. */}
      <img
        src="/stats/cloud-left.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-10 top-[calc(64%+24px)] hidden w-[clamp(220px,24vw,362px)] lg:block"
      />
      <img
        src="/stats/cloud-right.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-8 top-[calc(74%+24px)] hidden w-[clamp(200px,22vw,326px)] lg:block"
      />
      <img
        src="/stats/dashed-line.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[calc(6%-24px)] left-[24%] hidden w-[clamp(140px,16vw,230px)] lg:block"
      />

      <div className="relative z-10 mx-auto w-full max-w-360 px-8 md:px-34">
        <Reveal
          as="h2"
          className="max-w-3xl font-sans text-[clamp(36px,7.5vw,80px)] font-medium leading-none tracking-tight text-ink"
        >
          A glimpse at what we&rsquo;re capable of:
        </Reveal>

        {/* Stat grids — two rows with the Figma column proportions (369 vs 170px). */}
        <div className="mt-10 flex flex-col gap-6 md:mt-14 md:gap-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-[369fr_369fr_170fr_170fr] md:gap-8">
            {ROW_ONE.map((stat, i) => (
              <Reveal key={stat.value} delay={i * 80}>
                <StatCard {...stat} />
              </Reveal>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-[369fr_170fr_170fr_369fr] md:gap-8">
            {ROW_TWO.map((stat, i) => (
              <Reveal key={stat.value} delay={i * 80}>
                <StatCard {...stat} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* "Where our hackers HAVE BEEN" — centered label + letter grid. */}
      <div className="relative z-10 mx-auto mt-16 flex w-full max-w-360 flex-col items-center justify-center gap-8 px-8 md:mt-24 md:flex-row md:gap-24">
        <Reveal
          as="p"
          className="max-w-[12ch] text-center font-sans text-[clamp(24px,3.5vw,39px)] leading-[1.05] tracking-tight text-ink-soft md:text-left"
        >
          Where our hackers..
        </Reveal>
        <Reveal className="w-[clamp(260px,42vw,492px)]">
          <BoundingGrid
            cols={4}
            rows={2}
            cornerSize="lg"
            cellClassName="flex aspect-square items-center justify-center"
          >
            {LETTERS.map((letter, i) => (
              <span
                key={i}
                className="font-display text-[clamp(48px,7vw,94px)] leading-none tracking-tight text-ink"
              >
                {letter}
              </span>
            ))}
          </BoundingGrid>
        </Reveal>
      </div>
    </section>
  );
}
