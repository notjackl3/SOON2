import Nav from "@/components/nav";
import SectionHero from "@/components/section-hero";
import SectionConcept from "@/components/section-concept";
import SectionSpill from "@/components/section-spill";
import SectionRecap from "@/components/section-recap";
import SectionGuests from "@/components/section-guests";
import SectionSponsors from "@/components/section-sponsors";
import SectionTeam from "@/components/section-team";
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

      {/* Snap sequence ends at Spill. From here it's normal free-scroll, so the
          Recap (not a snap target) isn't flown past by the auto-glide. */}
      <SectionRecap />

      <SectionGuests />

      <SectionSponsors />

      <SectionTeam />

    {/* Footer sits on its own opaque background, after the 3D has faded out. */}
    <div className="relative bg-white">
      <SectionFooter />
    </div>
    </main>
  );
}
