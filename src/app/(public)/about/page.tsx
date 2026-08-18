// app/about/page.tsx
import { AboutHeroSection } from "@/components/sections/about-hero";
import { AboutSection } from "@/components/sections/about";
import { CoreValuesSection } from "@/components/sections/core-values";
import { ExperienceSection } from "@/components/sections/experience";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { mapExperiences } from "@/lib/utils/experience-mapper";
import { getEnv } from "@/lib/env";

const env = getEnv();

export const metadata: Metadata = {
  title: `About Me | ${env.NEXT_PUBLIC_SITE_NAME}`,
  description:
    "Learn more about my background, core values, experience, and the technologies I work with.",
};

export default async function AboutPage() {
  const rawExperiences = await prisma.experience.findMany({
    orderBy: { order: "asc" },
  });
  const experiences = mapExperiences(rawExperiences);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section dengan Parallax yang Dramatis */}
      <AboutHeroSection />

      {/* Profil & Tech Stack */}
      <AboutSection />

      {/* Core Values (Eksklusif untuk halaman ini) */}
      <CoreValuesSection />

      {/* Timeline Pengalaman */}
      <ExperienceSection experiences={experiences} />
    </div>
  );
}