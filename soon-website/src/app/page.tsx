import Nav from "@/components/nav";
import SectionHero from "@/components/section-hero";
import SectionConcept from "@/components/section-concept";
import SectionSpill from "@/components/section-spill";
import SectionFooter from "@/components/section-footer";
import SceneBackground from "@/components/three/scene-background";
import { SCROLL_SPAN_ID } from "@/components/three/constants";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Fixed WebGL canvas pinned behind everything. */}
      <SceneBackground />

      <Nav />

      {/* Scroll span that drives the camera scrub: Hero → Concept → Spill.
          These sections are transparent so the 3D shows through. */}
      <div id={SCROLL_SPAN_ID} className="relative">
        <SectionHero />
        <SectionConcept />
        <SectionSpill />
      </div>

      {/* Footer sits on its own opaque background, after the 3D has faded out. */}
      <div className="relative bg-white">
        <SectionFooter />
      </div>
    </main>
  );
}
