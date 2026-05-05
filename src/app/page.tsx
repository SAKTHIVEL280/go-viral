import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { FeaturesSection } from "@/components/sections/features-section";

export default function LandingPage() {
  return (
    <div className="bg-black">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
    </div>
  );
}
