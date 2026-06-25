"use client";

import { Marquee, type MarqueeTile } from "@/components/recap/marquee";
import { StatCallout } from "@/components/recap/stat-callout";
import { useScrollVelocity } from "@/components/recap/use-scroll-velocity";

/**
 * Placeholder carousel tiles. Drop event photos in /public/recap/ and set
 * `src` (e.g. "/recap/campfire.jpg"); `aspect` is width/height for sizing.
 * Tiles without a `src` render as gray "photo" placeholders.
 */
const TOP_TILES: MarqueeTile[] = [
  { aspect: 1.5 },
  { aspect: 1.3 },
  { aspect: 1.6 },
  { aspect: 1.45 },
  { aspect: 1.35 },
  { aspect: 1.55 },
];

const BOTTOM_TILES: MarqueeTile[] = [
  { aspect: 1.4 },
  { aspect: 1.6 },
  { aspect: 1.3 },
  { aspect: 1.5 },
  { aspect: 1.5 },
  { aspect: 1.35 },
];

/** Small on-brand pixel cluster (the Figma header "vector groups"). */
function PixelCluster() {
  const sq = "block size-2";
  return (
    <div aria-hidden className="flex items-end gap-1">
      <span className={`${sq} bg-ink`} />
      <span className={`${sq} bg-accent`} />
      <span className={`${sq} translate-y-1 bg-cobalt`} />
      <span className={`${sq} -translate-y-1 bg-accent`} />
      <span className={`${sq} bg-ink/70`} />
    </div>
  );
}

export default function SectionRecap() {
  const velocity = useScrollVelocity();

  return (
    <section
      data-snap-section
      className="relative w-full overflow-hidden bg-white py-16 md:py-24"
    >
      {/* Header */}
      <div className="mx-auto w-full max-w-360 px-8 md:px-34">
        <PixelCluster />
        <h2 className="mt-4 font-sans text-[clamp(36px,8vw,80px)] font-medium leading-none tracking-tight text-ink">
          Last time, we had&hellip;
        </h2>
      </div>

      {/* Carousels (full-bleed) with stats overlaid */}
      <div className="relative mt-10 md:mt-16">
        <div className="flex flex-col gap-10 md:gap-16">
          <Marquee tiles={TOP_TILES} direction={-1} velocityRef={velocity} />
          <Marquee tiles={BOTTOM_TILES} direction={1} velocityRef={velocity} />
        </div>

        {/* Stat overlay — pointer-events-none so card hover still works. */}
        <div className="pointer-events-none absolute inset-0">
          <div className="relative mx-auto h-full w-full max-w-360 px-8 md:px-34">
            <StatCallout
              value="70"
              label="Hackers"
              className="absolute left-8 top-[4%] md:left-34"
            />
            <StatCallout
              value="18"
              label="Sponsors"
              align="right"
              className="absolute right-8 top-1/2 -translate-y-1/2 md:right-34"
            />
            <StatCallout
              value="09"
              label="Activities"
              className="absolute bottom-[4%] left-8 md:left-34"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
