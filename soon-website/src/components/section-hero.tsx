/** Dotted-grid texture behind the hero. Rendered at its natural size and
 *  centered, so resizing the window clips the artwork instead of scaling it. */
const dotGrid: React.CSSProperties = {
  backgroundImage: "url('/hero/bg-dots.svg')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  backgroundSize: "auto",
};

/** A bordered label box with little squares at each corner (e.g. "COMING OCT '26"). */
function CornerBadge({ children }: { children: React.ReactNode }) {
  const corner = "absolute size-1.5 border border-line bg-white";
  return (
    <div className="relative inline-flex items-center justify-center border border-line bg-white px-4 py-1.5">
      <span className="text-[11px] uppercase text-black">{children}</span>
      <span className={`${corner} -left-[3px] -top-[3px]`} />
      <span className={`${corner} -right-[3px] -top-[3px]`} />
      <span className={`${corner} -bottom-[3px] -left-[3px]`} />
      <span className={`${corner} -bottom-[3px] -right-[3px]`} />
    </div>
  );
}

export default function SectionHero() {
  return (
    <section
      data-snap-section
      className="relative flex min-h-dvh flex-col overflow-hidden px-8 pb-16 pt-28 md:px-34"
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
                <p className="px-1.5 text-[16px] tracking-body text-muted">
                  Ontario&rsquo;s best builders. All making
                </p>
                <h1 className="font-display tracking-body text-[clamp(64px,10vw,120px)] leading-none text-black">
                  Something
                </h1>
              </div>

              {/* out of / Nothing */}
              <div className="flex items-end justify-between gap-3">
                <span className="self-start shrink-0 text-[clamp(23px,4.1vw,50px)] leading-none tracking-body text-black">
                  out of
                </span>
                <span className="h-[clamp(64px,10.5vw,132px)] relative flex flex-1 items-center justify-start">
                  <span className="relative inline-flex">
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-1/2 h-[55%] -translate-y-1/2 bg-accent"
                    />
                    <span className="relative font-display text-[clamp(79px,13.2vw,165px)] italic leading-[0.8] text-black">
                      Nothing
                    </span>
                  </span>
                </span>
              </div>
            </div>

            {/* goodbye / coming */}
            <div className="flex flex-col gap-4 md:pr-35">
              <div className="flex justify-end">
                <CornerBadge>Coming Oct &rsquo;26</CornerBadge>
              </div>
              <p className="max-w-60 text-[16px] tracking-body text-muted">
                Say goodbye to conventional hackathons.
              </p>
            </div>
          </div>

          {/* CTA row */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="rounded-[26px] border-[1.5px] border-[#a8e618] bg-accent/30 px-7 py-2.5 text-[clamp(12px,1.5vw,15px)] uppercase text-ink transition-colors hover:bg-accent/50"
            >
              Reserve your room
            </button>
            <CornerBadge>Location: TBA</CornerBadge>
          </div>
        </div>
      </div>
    </section>
  );
}
