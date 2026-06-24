import Image from "next/image";

/** A single stat: big number + uppercase caption. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-[clamp(64px,9vw,110px)] leading-none text-black">
        {value}
      </span>
      <span className="text-[14px] uppercase text-black">{label}</span>
    </div>
  );
}

export default function SectionConcept() {
  return (
    <section id="soon" className="relative w-full overflow-hidden bg-white">
      {/* 1440 design canvas — decorative SVGs use real canvas coordinates */}
      <div className="relative mx-auto w-full max-w-360">
        {/* blocks-right — decorative block cluster, pinned to the canvas (x=0, y=0) */}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
        <img
          src="/concept/blocks-right.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-202.5 w-30.25"
        />

        {/* top — INFO + right panel */}
        <div className="flex flex-col gap-16 px-8 pt-20 md:flex-row md:items-start md:justify-between md:gap-12 md:px-34 md:pt-35">
          {/* INFO */}
          <div className="flex max-w-163.75 flex-1 flex-col gap-10">
            <div className="flex flex-col">
              <div className="flex items-end gap-3">
                <span className="font-display text-[clamp(64px,11vw,130px)] font-medium italic leading-none text-black">
                  Welcome
                </span>
                <span className="text-[clamp(28px,5vw,65px)] leading-none tracking-body text-black">
                  to
                </span>
              </div>
              <Image
                src="/soon-wordmark.png"
                alt="SOON"
                width={1311}
                height={667}
                priority
                className="-mt-[clamp(16px,5vw,72px)] h-auto w-full max-w-163.75"
              />
            </div>

            <p className="max-w-103.75 text-[20px] tracking-body text-ink-soft">
              A 36-hour build experience where 40 top hackers live, eat, and
              build under one roof, collaborating with a group of partner
              companies to turn bold ideas into real products, while exposing
              talents.
            </p>
          </div>

          {/* right panel */}
          <div className="flex w-full flex-col items-end gap-9 md:w-115.25">
            {/* top right panel: arrow + image placeholder + stats */}
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
            {/* right panel graphics bottom — fixed size, does not resize */}
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
            <img
              src="/concept/starblock.svg"
              alt=""
              aria-hidden
              className="h-56 w-86"
            />
          </div>
        </div>

        {/* divider */}
        <div className="mx-8 my-12 h-px bg-line md:mx-34" />

        {/* bottom — "Ready to build something meaningful?" (rendered SVG, includes the vectors) */}
        <div className="px-8 pb-20 md:px-34 md:pb-35">
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered banner SVG */}
          <img
            src="/concept/meaningful.svg"
            alt="Ready to build something meaningful?"
            className="mx-auto w-full max-w-275.75"
          />
        </div>
      </div>
    </section>
  );
}
