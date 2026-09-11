"use client";

import { Providers } from "@/lib/providers";
import { ExperienceDetail } from "@/components/sections/experience-detail";
import type { MappedExperience } from "@/lib/utils/experience-mapper";

interface ExperienceDetailPageContentProps {
  exp: MappedExperience;
  prev: MappedExperience | null;
  next: MappedExperience | null;
}

export function ExperienceDetailPageContent({ exp, prev, next }: ExperienceDetailPageContentProps) {
  return (
    <Providers>
      <ExperienceDetail exp={exp} prev={prev} next={next} />
    </Providers>
  );
}
