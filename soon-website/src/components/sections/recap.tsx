"use client";

import ShapeGrid from "@/components/shapes/shape-grid";
import { Reveal } from "@/components/ui/reveal";
import { Marquee, type MarqueeTile } from "@/components/ui/marquee";
import { StatCallout } from "@/components/ui/stat-callout";
import { useScrollVelocity } from "@/hooks/use-scroll-velocity";

/**
 * Placeholder carousel tiles. Drop event photos in /public/recap/ and set
 * `src` (e.g. "/recap/campfire.jpg"); `aspect` is width/height for sizing.
 * Tiles without a `src` render as gray "photo" placeholders.
 */
const TOP_TILES: MarqueeTile[] = [
  { src: "/recap/row1-1.jpg", alt: "Hackers hanging out", aspect: 1.595 },
  { src: "/recap/row1-2.jpg", alt: "Hackers in matching tees", aspect: 1.488 },
  { src: "/recap/row1-3.jpg", alt: "Campfire at night", aspect: 1.406 },
  { src: "/recap/row1-4.jpg", alt: "Pool table", aspect: 1.406 },
  { src: "/recap/row1-5.jpg", alt: "Group celebrating", aspect: 1.406 },
];

const BOTTOM_TILES: MarqueeTile[] = [
  { src: "/recap/row2-1.jpg", alt: "Presentation to the room", aspect: 1.595 },
  { src: "/recap/row2-2.jpg", alt: "Group portrait", aspect: 1.406 },
  { src: "/recap/row2-3.jpg", alt: "First place announcement", aspect: 1.406 },
  { src: "/recap/row2-4.jpg", alt: "Sunset group photo", aspect: 1.488 },
  { src: "/recap/row2-5.jpg", alt: "Winners with awards", aspect: 1.406 },
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
      id="recap"
      data-snap-section
      className="relative w-full overflow-hidden bg-white py-16 md:py-24"
    >
      {/* Header (z-10 so the grid bleeding up stays behind the heading) */}
      <div className="relative z-10 mx-auto w-full max-w-360 px-8 md:px-34">
        <img
          src="/recap/vectors-top.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 hidden w-[clamp(160px,17vw,256px)] md:block"
        />
        <Reveal as="h2" className="mt-4 font-sans text-[clamp(36px,8vw,80px)] font-medium leading-none tracking-tight text-ink">
          Last time, we had&hellip;
        </Reveal>
      </div>

      {/* Carousels (full-bleed) with stats overlaid */}
      <div className="relative mt-10 md:mt-16">
        <div className="flex flex-col gap-10 md:gap-16">
          {/* Top row with the shape grid behind it. Same box and radial fade
              as the old bg-grid.svg it replaces (gray squares fading out from
              ~center); the grid's own vignette is off so the CSS mask fades it. */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute left-0 top-[120%] aspect-square w-3/4 -translate-y-1/2"
              style={{
                maskImage:
                  "radial-gradient(ellipse 55% 60% at 45% 45%, black 0%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 55% 60% at 45% 45%, black 0%, transparent 100%)",
              }}
            >
              <ShapeGrid
                shape="square"
                squareSize={26}
                speed={0.1}
                direction="right"
                hoverTrailAmount={0}
                borderColor="rgba(205, 206, 216, 0.7)"
                hoverFillColor="rgba(199, 255, 70, 0.6)"
                fadeColor="rgba(0, 0, 0, 0)"
              />
            </div>
            <div className="relative">
              <Marquee tiles={TOP_TILES} direction={-1} velocityRef={velocity} />
            </div>
          </div>
          <Marquee tiles={BOTTOM_TILES} direction={1} velocityRef={velocity} />
        </div>

        {/* Stat overlay — pointer-events-none so card hover still works. */}
        <div className="pointer-events-none absolute inset-0">
          <div className="relative mx-auto h-full w-full max-w-360 px-8 md:px-34">
            <StatCallout
              value="70"
              label="Hackers"
              delay={0}
              className="absolute left-8 top-[4%] md:left-34"
            />
            <StatCallout
              value="18"
              label="Sponsors"
              align="right"
              delay={150}
              className="absolute right-8 top-1/2 -translate-y-1/2 md:right-34"
            />
            <StatCallout
              value="09"
              label="Activities"
              delay={300}
              className="absolute bottom-[4%] left-8 md:left-34"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
