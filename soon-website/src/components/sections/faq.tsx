import { FaqList } from "@/sections/faq/accordion";
import { Highlight } from "@/components/ui/highlight";
import { Reveal } from "@/components/ui/reveal";
import { ShapeGridEdge } from "@/components/shapes/shape-grid-edge";

/**
 * FAQ section — an accent-highlighted "FAQ" heading over a stack of expandable
 * accordion boxes (see `faq/accordion`). Decorative vectors bleed off the
 * edges, matching the surrounding sections. Sits just before the footer.
 */
export default function SectionFaq() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-20 md:h-dvh md:py-28">
      {/* Animated shape grid, faded in from the right edge (desktop only) */}
      <ShapeGridEdge side="right" />

      {/* Decorative vectors (desktop only) — slide in from their edges. The
          bottom two keep their resting translate via restTransform. */}
      <Reveal
        as="img"
        x={-50}
        y={0}
        src="/faq/deco-top.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-6 top-6 hidden w-[clamp(160px,17vw,256px)] md:block md:left-20"
      />
      <Reveal
        as="img"
        x={-50}
        y={0}
        duration={900}
        restTransform="translateX(-50%)"
        src="/faq/deco-bottom-left.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 hidden w-[clamp(360px,54vw,777px)] md:block"
      />
      <Reveal
        as="img"
        x={50}
        y={0}
        duration={900}
        restTransform="translateX(8%)"
        src="/faq/deco-bottom-right.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 hidden w-[clamp(320px,46vw,657px)] md:block"
      />

      {/* pointer-events-none lets hovers fall through to the grid behind;
          the accordion re-enables them on itself. */}
      <div className="pointer-events-none relative mx-auto w-full max-w-360 px-8 md:px-34">
        {/* Heading — "FAQ" with the Q in display italic and an accent swipe */}
        <Reveal as="h2" className="mb-10 w-fit font-sans text-[clamp(52px,9vw,80px)] font-medium leading-none tracking-tight text-ink md:mb-14">
          <Highlight
            trigger="in-view"
            barClassName="inset-x-[-0.06em] bottom-[0.1em] top-[0.46em]"
          >
            <>
              FA<span className="font-display">Q</span>
            </>
          </Highlight>
        </Reveal>

        {/* Accordion stack (single-open) */}
        <FaqList />
      </div>
    </section>
  );
}
