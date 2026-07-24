import { type ReactNode } from "react";

import { BoundingBox } from "@/components/ui/bounding-box";
import { Reveal } from "@/components/ui/reveal";
import { StatHighlight } from "@/components/ui/stat-highlight";
import { StatsLetterGrid } from "@/components/sections/stats-letter-grid";

/**
 * "A glimpse at what we're capable of" — a single row of five achievement stats
 * from SOON 2025. Each stat card is a decorative <BoundingBox> with a big Playfair
 * number that reveals an accent-green highlight + pixel-flicker cluster on hover.
 * Below it sits the "Where our hackers HAVE BEEN" letter block.
 */

type Stat = { value: string; label: ReactNode };

const STATS: Stat[] = [
  {
    value: "25%",
    label: (
      <>
        Of Hackers Founded A Startup
      </>
    ),
  },
  {
    value: "4",
    label: (
      <>
        Actively Hiring
        <br />
        Positions
      </>
    ),
  },
  {
    value: "2",
    label: (
      <>
        Integrated Into
        <br />
        Sponsors&rsquo; System
      </>
    ),
  },
  { value: "30+", label: "Referrals Given" },
  { value: "300k", label: "Social Media Impressions" },
];

/** Big Playfair number stacked over an uppercase Inter label, framed by the box. */
function StatCard({ value, label }: Stat) {
  return (
    <BoundingBox cornerSize="lg" className="group flex h-26 flex-col justify-between p-3.5 sm:h-37.5 md:h-40 md:p-5">
      <span className="relative inline-block self-start font-display text-[clamp(40px,4.5vw,64px)] leading-[0.9] tracking-tight text-ink">
        <StatHighlight value={value} />
        <span className="relative z-10">{value}</span>
      </span>
      <span className="font-sans text-[11px] uppercase leading-tight tracking-tight text-ink-soft md:text-[15px]">
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
        className="pointer-events-none absolute -top-12 right-4 hidden aspect-[440.611/372.422] h-auto w-[clamp(220px,26vw,440px)] md:right-16 lg:block"
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
          className="max-w-3xl font-sans text-h2 font-medium leading-none tracking-tight text-ink"
        >
          At a <span className="font-display italic">glance</span>
        </Reveal>

        {/* Small eyebrow above the stat row. */}
        <Reveal
          as="p"
          delay={80}
          className="mt-6 font-sans text-base font-semibold tracking-tight text-ink md:mt-8"
        >
          During SOON 2025&hellip;
        </Reveal>

        {/* Stat row — five equal cards, single row on wide screens. */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:mt-8 md:grid-cols-3 md:gap-6 xl:grid-cols-5">
          {STATS.map((stat, i) => (
            <Reveal key={stat.value} delay={i * 80}>
              <StatCard {...stat} />
            </Reveal>
          ))}
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
          <StatsLetterGrid />
        </Reveal>
      </div>
    </section>
  );
}
