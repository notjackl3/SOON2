import Image from "next/image";

import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";

/** A single stat: big number (counts up on scroll-in) + uppercase caption. */
function Stat({
  value,
  label,
  delay = 0,
}: {
  value: string;
  label: string;
  delay?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="font-display text-[clamp(64px,9vw,110px)] leading-none text-black">
        <CountUp value={value} delay={delay} />
      </span>
      <span className="text-sm uppercase text-black">{label}</span>
    </div>
  );
}

export default function SectionConcept() {
  return (
    <section
      id="soon"
      className="relative w-full overflow-x-clip overflow-y-visible"
    >
      <div className="relative mx-auto w-full max-w-360">
        {/* blocks-right — decorative block cluster, pinned to the canvas (x=0, y=0) */}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
        <img
          src="/concept/left-blocks.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 -z-10 h-202.5 w-30.25"
        />

        {/* background-shapes — decorative band, centered, a bit above "Welcome" */}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
        <img
          src="/concept/background-shapes.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-48 -z-10 w-228 max-w-full -translate-x-1/2"
        />

        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-8 px-8 md:px-34 md:py-16">
            {/* top — welcome/SOON + stats panel (wraps) */}
            <div className="flex flex-col gap-16 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-12 md:gap-y-16">
              {/* INFO — welcome to soon */}
              <div className="flex max-w-160 flex-1 flex-col md:min-w-110">
                <Reveal className="flex items-end gap-3">
                  {/* sized a touch below the hero's "Something" */}
                  <span className="font-display text-[clamp(56px,8.5vw,104px)] font-medium italic leading-none text-black">
                    Welcome
                  </span>
                  {/* sized to match the hero's "out of" */}
                  <span className="text-[clamp(23px,4.1vw,50px)] leading-none tracking-body text-black">
                    to
                  </span>
                </Reveal>
                <Reveal delay={120}>
                  <Image
                    src="/soon-concept.png"
                    alt="SOON"
                    width={1311}
                    height={667}
                    priority
                    className="h-auto w-full max-w-145"
                  />
                </Reveal>
              </div>

              {/* right panel — arrow + image placeholder + stats */}
              <Reveal delay={180} className="flex w-full flex-col items-end gap-4 md:w-115.25 md:shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
                <img
                  src="/concept/arrow.svg"
                  alt=""
                  aria-hidden
                  className="h-17.25 w-27.25"
                />
                <div className="relative aspect-461/328 w-full overflow-hidden border border-[#b8b8b8] bg-white">
                  <Image
                    src="/concept/piccc.png"
                    alt="Inside the SOON hacker house"
                    fill
                    sizes="(max-width: 768px) 100vw, 461px"
                    className="object-cover"
                  />
                </div>
                {/* stats 
                <div className="flex w-full items-end justify-between gap-6">
                  <Stat value="50" label="hackers" delay={0} />
                  <Stat value="36" label="hours" delay={120} />
                  <Stat value="01" label="house" delay={240} />
                </div>
                */}
              </Reveal>
            </div>

            {/* divider */}
            <div className="h-px w-full bg-line" />

            {/* text + floating starblock */}
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <Reveal className="relative z-10 flex max-w-90 flex-col gap-3">
                <h3 className="font-sans text-[clamp(15px,1.7vw,20px)] font-bold tracking-tight text-ink-soft">
                  About SOON
                </h3>
                <p className="text-body leading-normal tracking-body text-muted">
                  We are creating a home for Canada&rsquo;s best builders to reach their full potential. A 36-hour experience where 50 builders live under one roof, collaborating with
                  companies and sponsors to turn bold ideas into real products.
                </p>
              </Reveal>
              <Reveal delay={120} className="relative z-10 flex max-w-90 flex-col gap-3">
                <h3 className="font-sans text-[clamp(15px,1.7vw,20px)] font-bold tracking-tight text-ink-soft">
                  Who we&rsquo;re looking for
                </h3>
                <p className="text-body leading-normal tracking-body text-muted">
                  We&rsquo;re looking for people who are passionate about building, learning, and growing together. If that sounds like you, join us at SOON.
                </p>
              </Reveal>
              {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
             <div className="flex flex-row">
                {/* scale (not height) so it spills over without growing the row */}
                <img
                  src="/concept/right-asterik.svg"
                  alt=""
                  aria-hidden
                  className="h-24 origin-center -translate-x-12 scale-150 transition-transform duration-500 ease-out hover:rotate-90"
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
