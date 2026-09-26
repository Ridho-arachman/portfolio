"use client";

import dynamic from "next/dynamic";
import { Providers } from "@/lib/providers";
import { AboutHeroSection } from "@/components/sections/about-hero";
import { AboutSection } from "@/components/sections/about";
import { LazySection } from "@/components/ui/lazy-section";
import type { MappedExperience } from "@/lib/utils/experience-mapper";

const ExperienceSection = dynamic(
  () => import("@/components/sections/experience").then((m) => m.ExperienceSection),
  { ssr: false, loading: () => <div className="min-h-[70vh]" aria-hidden /> },
);

interface AboutPageContentProps {
  experiences: MappedExperience[];
}

export function AboutPageContent({ experiences }: AboutPageContentProps) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <AboutHeroSection />
        <AboutSection />
        <LazySection placeholder={<div className="min-h-[70vh]" aria-hidden />}>
          <ExperienceSection experiences={experiences} />
        </LazySection>
      </div>
    </Providers>
  );
}
