import { Reveal } from "@/components/reveal";
import { FADE_ID } from "@/components/three/constants";

/**
 * Final slide of the 3D sequence: one viewport tall, centered, carrying the
 * "Ready to build something meaningful?" artwork. Holds the {@link FADE_ID} so
 * the 3D background fades out as we glide past it into the next section.
 */
export default function SectionSpill() {
  return (
    <section
      id={FADE_ID}
      data-snap-section
      className="relative flex h-dvh items-center justify-center px-8"
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
