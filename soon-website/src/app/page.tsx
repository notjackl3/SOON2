import Nav from "@/components/nav";
import SectionHero from "@/components/sections/hero";
import SectionHousePolaroids from "@/components/sections/house-polaroids";
import SectionConcept from "@/components/sections/concept";
import SectionSpill from "@/components/sections/spill";
import SectionRecap from "@/components/sections/recap";
import SectionGuests from "@/components/sections/guests";
import SectionSponsors from "@/components/sections/sponsors";
import SectionPastSponsors from "@/components/sections/past-sponsors";
import SectionStats from "@/components/sections/stats";
import SectionTeam from "@/components/sections/team";
import SectionTestimonials from "@/components/sections/testimonials";
import SectionFaq from "@/components/sections/faq";
import SectionFooter from "@/components/sections/footer";
import SceneBackground from "@/components/three/scene-background";
import { SCROLL_SPAN_ID } from "@/components/three/constants";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip">
      {/* Fixed WebGL canvas pinned behind everything. */}
      <SceneBackground />

      <Nav />

      <div id={SCROLL_SPAN_ID} className="relative">
        <SectionHero />
        <SectionHousePolaroids enabled={false} />
        <SectionConcept />
        <div className="h-96"/>
        <SectionSpill />
      </div>

      <SectionRecap />

      <SectionTestimonials />

      <SectionGuests />

      <SectionStats />

      <SectionPastSponsors />

      <SectionSponsors />

      <SectionTeam />

      <SectionFaq />

      <SectionFooter />
    </main>
  );
}
