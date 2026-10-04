"use client";

import { useRef } from "react";
import type { CertificateListData } from "./constants";
import type { Project } from "@/components/sections/projects/constants";
import type { ExperienceListData } from "@/components/sections/experience-list/constants";
import { CertificateDetailHero } from "./certificate-detail-hero";
import { CertificateDetailContent } from "./certificate-detail-content";
import { CertificateDetailGallery } from "./certificate-detail-gallery";
import { CertificateDetailNavigation } from "./certificate-detail-navigation";
import {
  CertificateRelatedExperiences,
  CertificateRelatedProjects,
} from "./certificate-detail-related";

interface CertificateDetailProps {
  cert: CertificateListData;
  prev: CertificateListData | null;
  next: CertificateListData | null;
  relatedProjects: Project[];
  relatedExperiences: ExperienceListData[];
}

export function CertificateDetail({
  cert,
  prev,
  next,
  relatedProjects,
  relatedExperiences,
}: CertificateDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-bg-primary">
      <CertificateDetailHero cert={cert} />

      <div className="container mx-auto px-4 max-w-5xl py-16 md:py-24">
        <CertificateDetailContent cert={cert} />

        <CertificateDetailGallery cert={cert} />

        <CertificateRelatedProjects projects={relatedProjects} />

        <CertificateRelatedExperiences experiences={relatedExperiences} />

        <CertificateDetailNavigation prev={prev} next={next} />
      </div>
    </div>
  );
}