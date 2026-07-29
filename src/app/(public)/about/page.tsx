// app/about/page.tsx
import { AboutHeroSection } from "@/components/sections/about-hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { CoreValuesSection } from "@/components/sections/core-values-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Me | Ridho.dev",
  description:
    "Learn more about my background, core values, experience, and the technologies I work with.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section dengan Parallax yang Dramatis */}
      <AboutHeroSection />

      {/* Profil & Tech Stack */}
      <AboutSection />

      {/* Core Values (Eksklusif untuk halaman ini) */}
      <CoreValuesSection />

      {/* Timeline Pengalaman */}
      <ExperienceSection />
    </main>
  );
}
