import Nav from "@/components/nav";
import SectionHero from "@/components/sections/hero";
import SectionConcept from "@/components/sections/concept";
import SectionSpill from "@/components/sections/spill";
import SectionRecap from "@/components/sections/recap";
import SectionImpact from "@/components/sections/impact";
import SectionGuests from "@/components/sections/guests";
import SectionSponsors from "@/components/sections/sponsors";
import SectionTeam from "@/components/sections/team";
import SectionFaq from "@/components/sections/faq";
import SectionFooter from "@/components/sections/footer";
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

      <SectionImpact />

      <SectionGuests />

      <SectionSponsors />

      <SectionTeam />

      <SectionFaq />

      <SectionFooter />
    </main>
  );
}
