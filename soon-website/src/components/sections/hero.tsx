import { Highlight } from "@/components/ui/highlight";
import { ReserveButton } from "@/components/ui/reserve-button";
import { Reveal } from "@/components/ui/reveal";

/** Dotted-grid texture behind the hero. Rendered at its natural size and
 *  centered, so resizing the window clips the artwork instead of scaling it. */
const dotGrid: React.CSSProperties = {
  backgroundImage: "url('/background-patterns/bg-dots.svg')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  backgroundSize: "auto",
};

/** A bordered label box with little squares at each corner (e.g. "COMING OCT '26"). */
function CornerBadge({ children }: { children: React.ReactNode }) {
  const corner = "absolute size-2 border border-line bg-white";
  return (
    <div className="relative inline-flex items-center justify-center border border-line bg-white px-6 py-3">
      <span className="text-[13px] uppercase text-black">{children}</span>
      <span className={`${corner} -left-1 -top-1`} />
      <span className={`${corner} -right-1 -top-1`} />
      <span className={`${corner} -bottom-1 -left-1`} />
      <span className={`${corner} -bottom-1 -right-1`} />
    </div>
  );
}

export default function SectionHero() {
  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col overflow-hidden px-8 pb-16 pt-28 md:px-34"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={dotGrid}
      />
      <div className="relative mx-auto flex w-full max-w-360 flex-1 flex-col justify-start">
        <div className="flex w-full max-w-195 flex-col gap-3">
          {/* Everything except the CTA row */}
          <div className="flex max-w-165 flex-col gap-6">
            {/* title-text */}
            <div className="flex flex-col gap-2">
              {/* eyebrow + Something */}
              <div className="flex flex-col gap-1">
                <Reveal as="p" className="px-1.5 text-[clamp(16px,1.4vw,18px)] tracking-body text-muted">
                  Canada&rsquo;s best builders. All making
                </Reveal>
                <Reveal as="h1" delay={90} className="font-display tracking-body text-[clamp(64px,10vw,120px)] leading-none text-black">
                  Something
                </Reveal>
              </div>

              {/* out of / Nothing */}
              <Reveal delay={180} className="flex items-end justify-between gap-3">
                <span className="self-start shrink-0 text-[clamp(23px,4.1vw,50px)] leading-none tracking-body text-black">
                  out of
                </span>
                <span className="h-[clamp(64px,10.5vw,132px)] relative flex flex-1 items-center justify-start">
                  <Highlight
                    trigger="scroll"
                    revealDelay={650}
                    barClassName="inset-x-0 top-1/2 h-[55%] -translate-y-1/2"
                  >
                    <span className="font-display text-[clamp(79px,13.2vw,165px)] italic leading-[0.8] text-black">
                      Nothing
                    </span>
                  </Highlight>
                </span>
              </Reveal>
            </div>

            {/* goodbye / coming */}
            <Reveal delay={270} className="flex flex-col gap-4 md:pr-35">
              {/* Badges: side-by-side on one line on mobile (Coming Oct +
                  Location TBA); on desktop only Coming Oct sits here and
                  Location TBA drops to the CTA row. */}
              <div className="flex justify-between gap-3 md:justify-end">
                <Reveal delay={1350} y={0} scale={0} duration={450}>
                  <CornerBadge>Coming Oct &rsquo;26</CornerBadge>
                </Reveal>
                <Reveal delay={1500} y={0} scale={0} duration={450} className="md:hidden">
                  <CornerBadge>Location: TBA</CornerBadge>
                </Reveal>
              </div>
              <p className="max-w-105 text-balance text-[clamp(16px,1.4vw,18px)] tracking-body text-muted">
                Join 50 of Canada's best builders in a multimillion dollar private mansion. Build, ship, and connect with industry leaders, all in one weekend.
              </p>
            </Reveal>
          </div>

          {/* CTA row */}
          <Reveal delay={360} className="flex items-center justify-between gap-4">
            <ReserveButton />
            {/* Desktop only — on mobile this badge sits beside "Coming Oct". */}
            <Reveal delay={1500} y={0} scale={0} duration={450} className="hidden md:block">
              <CornerBadge>Location: TBA</CornerBadge>
            </Reveal>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
