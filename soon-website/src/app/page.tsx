import Nav from "@/components/nav";
import SectionHero from "@/components/section-hero";
import SectionConcept from "@/components/section-concept";
import SectionSpill from "@/components/section-spill";
import SectionRecap from "@/components/section-recap";
import SectionGuests from "@/components/section-guests";
import SectionSponsors from "@/components/section-sponsors";
import SectionTeam from "@/components/section-team";
import SectionFaq from "@/components/section-faq";
import SectionFooter from "@/components/section-footer";
import SceneBackground from "@/components/three/scene-background";
import { SCROLL_SPAN_ID } from "@/components/three/constants";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col">
      {/* Fixed WebGL canvas pinned behind everything. */}
      <SceneBackground />

      <Nav />

      <div id={SCROLL_SPAN_ID} className="relative">
        <SectionHero />
        <div className="h-150"/>
        <SectionConcept />
        <div className="h-96"/>
        <SectionSpill />
      </div>

      <SectionRecap />

      <SectionGuests />

      <SectionSponsors />

      <SectionTeam />

      <SectionFaq />

      <SectionFooter />
    </main>
  );
}
