import Image from "next/image";

/** A single stat: big number + uppercase caption. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-[clamp(64px,9vw,110px)] leading-none text-black">
        {value}
      </span>
      <span className="text-sm uppercase text-black">{label}</span>
    </div>
  );
}

export default function SectionConcept() {
  return (
    <section
      id="soon"
      data-snap-section
      data-snap-duration="1.5"
      className="relative w-full overflow-hidden"
    >
      <div className="relative mx-auto w-full max-w-360">
        {/* blocks-right — decorative block cluster, pinned to the canvas (x=0, y=0) */}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
        <img
          src="/concept/left-blocks.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-202.5 w-30.25"
        />

        {/* background-shapes — decorative band, centered, a bit above "Welcome" */}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
        <img
          src="/concept/background-shapes.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-48 w-228 max-w-full -translate-x-1/2"
        />

        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-8 px-8 md:px-34 md:py-16">
            {/* top — welcome/SOON + stats panel (wraps) */}
            <div className="flex flex-col gap-16 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-12 md:gap-y-16">
              {/* INFO — welcome to soon */}
              <div className="flex max-w-160 flex-1 flex-col md:min-w-110">
                <div className="flex items-end gap-3">
                  {/* sized a touch below the hero's "Something" */}
                  <span className="font-display text-[clamp(56px,8.5vw,104px)] font-medium italic leading-none text-black">
                    Welcome
                  </span>
                  {/* sized to match the hero's "out of" */}
                  <span className="text-[clamp(23px,4.1vw,50px)] leading-none tracking-body text-black">
                    to
                  </span>
                </div>
                <Image
                  src="/soon-concept.png"
                  alt="SOON"
                  width={1311}
                  height={667}
                  priority
                  className="h-auto w-full max-w-145"
                />
              </div>

              {/* right panel — arrow + image placeholder + stats */}
              <div className="flex w-full flex-col items-end gap-4 md:w-115.25 md:shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
                <img
                  src="/concept/arrow.svg"
                  alt=""
                  aria-hidden
                  className="h-17.25 w-27.25"
                />
                <div className="aspect-461/328 w-full border border-[#b8b8b8] bg-white" />
                <div className="flex w-full items-end justify-between gap-6">
                  <Stat value="40" label="hackers" />
                  <Stat value="36" label="hours" />
                  <Stat value="01" label="house" />
                </div>
              </div>
            </div>

            {/* divider */}
            <div className="h-px w-full bg-line" />

            {/* text + floating starblock */}
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <p className="max-w-103.75 text-4 tracking-body text-ink-soft">
                A 36-hour build experience where 40 top hackers live, eat, and
                build under one roof, collaborating with a group of partner
                companies to turn bold ideas into real products, while exposing
                talents.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
             <div className="flex flex-row">
                {/* scale (not height) so it spills over without growing the row */}
                <img
                  src="/concept/right-asterik.svg"
                  alt=""
                  aria-hidden
                  className="h-24 origin-bottom scale-150"
                />
                <img
                  src="/concept/right-blocks.svg"
                  alt=""
                  aria-hidden
                  className="h-24"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
