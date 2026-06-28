import { Button } from "@/components/button";
import { Reveal } from "@/components/reveal";

export default function SectionSponsors() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-20 md:py-28">
      {/* Decorative bubble cluster — bleeds off the right edge of the screen.
          Keeps its resting -translate-y-1/2 translate-x-[20%] via restTransform. */}
      <Reveal
        as="img"
        x={70}
        y={0}
        duration={900}
        restTransform="translateY(-50%) translateX(20%)"
        src="/sponsors/bubbles.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 hidden w-[clamp(260px,28vw,440px)] md:block"
      />

      <div className="relative mx-auto w-full max-w-360 px-8 md:px-34">
        {/* Left bracket — in the gutter, top-aligned (out of flow so the heading
            keeps the site's left margin) */}
        <Reveal
          as="img"
          x={-50}
          y={0}
          src="/sponsors/bracket-left.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-6 top-0 hidden h-[clamp(120px,16vw,183px)] md:block"
        />

        <div className="relative flex flex-col gap-8 md:flex-row md:items-stretch md:gap-10">
          {/* Heading — hugs its text so the group sits snug to its right */}
          <Reveal as="h2" className="w-fit font-sans text-[clamp(44px,7.5vw,80px)] font-medium leading-none tracking-tight text-ink">
            Sponsors
            <br />
            coming <span className="font-display italic">SOON</span>
          </Reveal>

          {/* Pill (top, level with "Sponsors") + subtext (bottom, level with "coming SOON") */}
          <Reveal delay={140} className="flex shrink-0 flex-col items-start gap-5 md:justify-between md:gap-0 md:self-stretch md:py-1">
            <Button className="py-3 text-[clamp(13px,1.4vw,20px)] tracking-tight">
              Partner with us
            </Button>
            <p className="max-w-52 text-[clamp(16px,1.6vw,20px)] tracking-body text-ink-soft">
              but trust us, you&rsquo;ll know the names.
            </p>
          </Reveal>

          {/* Right bracket — lower (self-end) for the diagonal arrangement */}
          <Reveal
            as="img"
            x={50}
            y={0}
            delay={120}
            src="/sponsors/bracket-right.svg"
            alt=""
            aria-hidden
            className="pointer-events-none hidden h-[clamp(80px,11vw,114px)] shrink-0 self-end lg:block"
          />
        </div>
      </div>
    </section>
  );
}
