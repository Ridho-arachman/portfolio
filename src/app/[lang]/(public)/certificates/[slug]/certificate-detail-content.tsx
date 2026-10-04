"use client";

import { Providers } from "@/lib/providers";
import { CertificateDetail } from "@/components/sections/certificate-detail";
import type { CertificateListData } from "@/components/sections/certificates/constants";
import type { Project } from "@/components/sections/projects/constants";
import type { ExperienceListData } from "@/components/sections/experience-list/constants";

interface CertificateDetailPageContentProps {
  cert: CertificateListData;
  prev: CertificateListData | null;
  next: CertificateListData | null;
  relatedProjects: Project[];
  relatedExperiences: ExperienceListData[];
}

export function CertificateDetailPageContent({
  cert,
  prev,
  next,
  relatedProjects,
  relatedExperiences,
}: CertificateDetailPageContentProps) {
  return (
    <Providers>
      <CertificateDetail
        cert={cert}
        prev={prev}
        next={next}
        relatedProjects={relatedProjects}
        relatedExperiences={relatedExperiences}
      />
    </Providers>
  );
}