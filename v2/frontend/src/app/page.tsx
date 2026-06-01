import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { AboutSection } from "@/components/landing/AboutSection";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <>
      <LandingNav />
      <LandingHero />
      <FeatureGrid />
      <AboutSection />
      <LandingCta />
      <LandingFooter />
    </>
  );
}
