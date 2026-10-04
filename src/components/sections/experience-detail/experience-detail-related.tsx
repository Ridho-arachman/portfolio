"use client";

import { Award, FolderKanban } from "lucide-react";
import { CertificateCard } from "@/components/sections/certificates/certificate-card";
import type { CertificateListData } from "@/components/sections/certificates/constants";
import { ProjectCard } from "@/components/sections/projects/project-card";
import type { Project } from "@/components/sections/projects/constants";
import { useTranslation } from "@/hooks/use-translation";

interface ExperienceRelatedProjectsProps {
  projects: Project[];
}

export function ExperienceRelatedProjects({
  projects,
}: ExperienceRelatedProjectsProps) {
  const { t } = useTranslation();

  if (projects.length === 0) return null;

  return (
    <section
      aria-labelledby="experience-related-projects-heading"
      className="mt-10 animate-fade-in-up delay-200"
    >
      <h2
        id="experience-related-projects-heading"
        className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6"
      >
        <FolderKanban className="w-6 h-6 md:w-8 md:h-8 text-accent" />
        {t.experienceDetail.relatedProjects}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}

interface ExperienceRelatedCertificatesProps {
  certificates: CertificateListData[];
}

export function ExperienceRelatedCertificates({
  certificates,
}: ExperienceRelatedCertificatesProps) {
  const { t } = useTranslation();

  if (certificates.length === 0) return null;

  return (
    <section
      aria-labelledby="experience-related-certificates-heading"
      className="mt-10 animate-fade-in-up delay-200"
    >
      <h2
        id="experience-related-certificates-heading"
        className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6"
      >
        <Award className="w-6 h-6 md:w-8 md:h-8 text-accent" />
        {t.experienceDetail.relatedCertificates}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert, index) => (
          <CertificateCard key={cert.slug} cert={cert} index={index} />
        ))}
      </div>
    </section>
  );
}