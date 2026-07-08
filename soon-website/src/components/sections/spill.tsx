import { Reveal } from "@/components/ui/reveal";
import { FADE_ID } from "@/components/three/constants";

/**
 * Final slide of the 3D sequence: one viewport tall, centered, carrying the
 * "Ready to build something meaningful?" artwork. Holds the {@link FADE_ID} so
 * the 3D background fades out as we glide past it into the next section.
 *
 * Sized with `h-svh` (a static, toolbar-shown viewport height), not `h-dvh`:
 * `dvh` changes as iOS Safari's URL bar shows/hides, which reflowed the carousel
 * below and made the 3D→carousel boundary jump when scrolling up/down there.
 */
export default function SectionSpill() {
  return (
    <section
      id={FADE_ID}
      data-snap-section
      className="relative flex h-svh items-center justify-center px-8"
    >
      <Reveal
        as="img"
        y={0}
        scale={0.94}
        duration={900}
        src="/concept/meaningful.svg"
        alt="Ready to build something meaningful?"
        className="mx-auto w-full max-w-275.75"
      />
    </section>
  );
}
