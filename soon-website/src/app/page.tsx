import Nav from "@/components/nav";
import SectionHero from "@/components/section-hero";
import SectionConcept from "@/components/section-concept";
import SectionSpill from "@/components/section-spill";
import SectionFooter from "@/components/section-footer";
import SceneBackground from "@/components/three/scene-background";
import { SCROLL_SPAN_ID } from "@/components/three/constants";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col">
      {/* Fixed WebGL canvas pinned behind everything. */}
      <SceneBackground />

      <Nav />

      {/* Scroll span that drives the camera scrub: Hero → Concept → Spill.
          These sections are transparent so the 3D shows through. */}
      <div id={SCROLL_SPAN_ID} className="relative">
        <SectionHero />
        <div className="h-150"/>
        <SectionConcept />
        <div className="h-96"/>
        <SectionSpill />
      </div>

      {/* Footer sits on its own opaque background, after the 3D has faded out.
          It's the final snap stop ("one more slide into the next section").
          When you add sections after Concept/Spill, move/extend
          `data-snap-section` onto whichever sections should be slides. */}
      <div data-snap-section className="relative bg-white">
        <SectionFooter />
      </div>
    </main>
  );
}
