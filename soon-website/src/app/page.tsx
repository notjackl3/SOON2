import Nav from "@/components/nav";
import SectionHero from "@/components/section-hero";
import SectionConcept from "@/components/section-concept";
import SectionFooter from "@/components/section-footer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-white">
      <Nav />
      <SectionHero />
      <SectionConcept />
      <SectionFooter />
    </main>
  );
}
