"use client";

import { useRef, useState } from "react";
import type { Project } from "./constants";
import { ProjectDetailHero } from "./project-detail-hero";
import { ProjectDetailContent } from "./project-detail-content";
import { ProjectDetailGallery } from "./project-detail-gallery";
import { ProjectDetailNavigation } from "./project-detail-navigation";
import { ProjectDetailLightbox } from "./project-detail-lightbox";

interface ProjectDetailProps {
  project: Project;
  prev: Project | null;
  next: Project | null;
}

export function ProjectDetail({ project, prev, next }: ProjectDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-bg-primary overflow-hidden">
      <ProjectDetailHero project={project} />

      <div className="container relative mx-auto px-4 max-w-5xl py-16 md:py-24">
        {/* Background blobs - CSS animations */}
        <div className="absolute top-20 right-0 w-100 h-100 bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-float" />
        <div className="absolute bottom-20 left-0 w-125 h-125 bg-white/5 rounded-full blur-[120px] pointer-events-none animate-float-delayed" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2 space-y-8">
            <ProjectDetailContent project={project} />
          </div>
          <ProjectDetailGallery
            project={project}
            onSelect={setSelectedImage}
          />
        </div>

        <div className="relative z-10">
          <ProjectDetailNavigation prev={prev} next={next} />
        </div>
      </div>

      {selectedImage && (
        <ProjectDetailLightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          project={project}
        />
      )}
    </div>
  );
}
