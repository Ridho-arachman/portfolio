"use client";

import { Providers } from "@/lib/providers";
import { ExperienceDetail } from "@/components/sections/experience-detail";
import type { MappedExperience } from "@/lib/utils/experience-mapper";
import type { Project } from "@/components/sections/projects/constants";
import type { CertificateListData } from "@/components/sections/certificates/constants";

interface ExperienceDetailPageContentProps {
  exp: MappedExperience;
  prev: MappedExperience | null;
  next: MappedExperience | null;
  relatedProjects: Project[];
  relatedCertificates: CertificateListData[];
}

export function ExperienceDetailPageContent({
  exp,
  prev,
  next,
  relatedProjects,
  relatedCertificates,
}: ExperienceDetailPageContentProps) {
  return (
    <Providers>
      <ExperienceDetail
        exp={exp}
        prev={prev}
        next={next}
        relatedProjects={relatedProjects}
        relatedCertificates={relatedCertificates}
      />
    </Providers>
  );
}