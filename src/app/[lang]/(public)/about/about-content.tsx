"use client";

import { Providers } from "@/lib/providers";
import { AboutHeroSection } from "@/components/sections/about-hero";
import { AboutSection } from "@/components/sections/about";
import { ExperienceSection } from "@/components/sections/experience";
import type { MappedExperience } from "@/lib/utils/experience-mapper";

interface AboutPageContentProps {
  experiences: MappedExperience[];
}

export function AboutPageContent({ experiences }: AboutPageContentProps) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <AboutHeroSection />
        <AboutSection />
        <ExperienceSection experiences={experiences} />
      </div>
    </Providers>
  );
}
