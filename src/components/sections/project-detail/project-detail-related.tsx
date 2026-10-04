"use client";

import { Award, Briefcase } from "lucide-react";
import { CertificateCard } from "@/components/sections/certificates/certificate-card";
import type { CertificateListData } from "@/components/sections/certificates/constants";
import { ExperienceListItem } from "@/components/sections/experience-list/experience-list-item";
import type { ExperienceListData } from "@/components/sections/experience-list/constants";
import { useTranslation } from "@/hooks/use-translation";

interface ProjectRelatedCertificatesProps {
  certificates: CertificateListData[];
}

export function ProjectRelatedCertificates({
  certificates,
}: ProjectRelatedCertificatesProps) {
  const { t } = useTranslation();

  if (certificates.length === 0) return null;

  return (
    <section
      aria-labelledby="project-related-certificates-heading"
      className="mt-10 animate-fade-in-up delay-200"
    >
      <h2
        id="project-related-certificates-heading"
        className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6"
      >
        <Award className="w-6 h-6 md:w-8 md:h-8 text-accent" />
        {t.projectDetail.relatedCertificates}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert, index) => (
          <CertificateCard key={cert.slug} cert={cert} index={index} />
        ))}
      </div>
    </section>
  );
}

interface ProjectRelatedExperiencesProps {
  experiences: ExperienceListData[];
}

export function ProjectRelatedExperiences({
  experiences,
}: ProjectRelatedExperiencesProps) {
  const { t } = useTranslation();

  if (experiences.length === 0) return null;

  return (
    <section
      aria-labelledby="project-related-experiences-heading"
      className="mt-10 animate-fade-in-up delay-200"
    >
      <h2
        id="project-related-experiences-heading"
        className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6"
      >
        <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-accent" />
        {t.projectDetail.relatedExperiences}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiences.map((exp, index) => (
          <ExperienceListItem key={exp.id} exp={exp} index={index} />
        ))}
      </div>
    </section>
  );
}