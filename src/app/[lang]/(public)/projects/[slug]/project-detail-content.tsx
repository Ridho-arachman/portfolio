"use client";

import { Providers } from "@/lib/providers";
import { ProjectDetail } from "@/components/sections/project-detail";
import type { Project } from "@/components/sections/projects/constants";
import type { CertificateListData } from "@/components/sections/certificates/constants";
import type { ExperienceListData } from "@/components/sections/experience-list/constants";

interface ProjectDetailPageContentProps {
  project: Project;
  prev: Project | null;
  next: Project | null;
  relatedCertificates: CertificateListData[];
  relatedExperiences: ExperienceListData[];
}

export function ProjectDetailPageContent({
  project,
  prev,
  next,
  relatedCertificates,
  relatedExperiences,
}: ProjectDetailPageContentProps) {
  return (
    <Providers>
      <ProjectDetail
        project={project}
        prev={prev}
        next={next}
        relatedCertificates={relatedCertificates}
        relatedExperiences={relatedExperiences}
      />
    </Providers>
  );
}