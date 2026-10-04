"use client";

import { Briefcase, FolderKanban } from "lucide-react";
import { ExperienceListItem } from "@/components/sections/experience-list/experience-list-item";
import type { ExperienceListData } from "@/components/sections/experience-list/constants";
import { ProjectCard } from "@/components/sections/projects/project-card";
import type { Project } from "@/components/sections/projects/constants";
import { useTranslation } from "@/hooks/use-translation";

interface CertificateRelatedProjectsProps {
  projects: Project[];
}

export function CertificateRelatedProjects({
  projects,
}: CertificateRelatedProjectsProps) {
  const { t } = useTranslation();

  if (projects.length === 0) return null;

  return (
    <section
      aria-labelledby="certificate-related-projects-heading"
      className="mt-10 animate-fade-in-up delay-200"
    >
      <h2
        id="certificate-related-projects-heading"
        className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6"
      >
        <FolderKanban className="w-6 h-6 md:w-8 md:h-8 text-accent" />
        {t.certificateDetail.relatedProjects}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}

interface CertificateRelatedExperiencesProps {
  experiences: ExperienceListData[];
}

export function CertificateRelatedExperiences({
  experiences,
}: CertificateRelatedExperiencesProps) {
  const { t } = useTranslation();

  if (experiences.length === 0) return null;

  return (
    <section
      aria-labelledby="certificate-related-experiences-heading"
      className="mt-10 animate-fade-in-up delay-200"
    >
      <h2
        id="certificate-related-experiences-heading"
        className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6"
      >
        <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-accent" />
        {t.certificateDetail.relatedExperiences}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiences.map((exp, index) => (
          <ExperienceListItem key={exp.id} exp={exp} index={index} />
        ))}
      </div>
    </section>
  );
}