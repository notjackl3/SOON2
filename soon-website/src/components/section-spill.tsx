import { FADE_ID } from "@/components/three/constants";

/**
 * Transitional placeholder section after Concept. Its extra height gives the
 * camera animation room to finish scrubbing, and the 3D background fades out
 * across it (it carries the {@link FADE_ID}) so the scene is gone by the Footer.
 *
 * Replace the inner content with real transitional copy whenever you like — the
 * only structural requirements are the `id` and enough height to scroll.
 */
export default function SectionSpill() {
  return (
    <section
      id={FADE_ID}
      className="relative flex min-h-[160vh] items-center justify-center px-8"
    >
      <p className="max-w-xl text-center font-display text-[clamp(28px,4vw,52px)] italic leading-tight text-black">
        Built in one place.
      </p>
    </section>
  );
}
