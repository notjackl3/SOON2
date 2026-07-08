import { PartnerButton } from "@/components/ui/partner-button";
import { Reveal } from "@/components/ui/reveal";

export default function SectionSponsors() {
  return (
    <section id="sponsors" className="relative w-full bg-white py-20 md:py-28">
      {/* Decorative bubble cluster — anchored to the right edge. The rightmost
          artwork is the colored circles (they reach the full viewBox width), so
          it sits flush to the edge with no outward push: any translateX would
          shove those circles under the section's overflow-hidden and clip them. */}
      <Reveal 
        as="img"
        x={70}
        y={0}
        duration={900}
        restTransform="translateY(-50%)"
        src="/sponsors/bubbles.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-[-10] bottom-[-70] md:top-34 w-[40vw] lg:w-[clamp(260px,28vw,440px)]"
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
          className="pointer-events-none absolute left-6 top-[-64] hidden h-[clamp(120px,16vw,183px)] md:block"
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
            <PartnerButton />
            {/* Hard break keeps "know the names." together on the second line
                at every size, instead of leaving "names." stranded alone. */}
            <p className="max-w-52 text-[clamp(16px,1.6vw,20px)] tracking-body text-ink-soft">
              but trust us, you&rsquo;ll
              <br />
              know the names.
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
