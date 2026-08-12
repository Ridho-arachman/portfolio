// app/about/page.tsx
import { AboutHeroSection } from "@/components/sections/about-hero";
import { AboutSection } from "@/components/sections/about";
import { CoreValuesSection } from "@/components/sections/core-values";
import { ExperienceSection } from "@/components/sections/experience";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Me | Ridho.dev",
  description:
    "Learn more about my background, core values, experience, and the technologies I work with.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section dengan Parallax yang Dramatis */}
      <AboutHeroSection />

      {/* Profil & Tech Stack */}
      <AboutSection />

      {/* Core Values (Eksklusif untuk halaman ini) */}
      <CoreValuesSection />

      {/* Timeline Pengalaman */}
      <ExperienceSection />
    </div>
  );
}
