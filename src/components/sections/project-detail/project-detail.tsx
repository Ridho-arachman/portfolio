"use client";

import { useRef, useState } from "react";
import type { Project } from "./constants";
import { useProjectDetail } from "./use-project-detail";
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
  const { headerY, headerScale, headerOpacity } =
    useProjectDetail(containerRef);

  return (
    <>
      <div ref={containerRef} className="min-h-screen bg-bg-primary">
        <ProjectDetailHero
          project={project}
          headerY={headerY}
          headerScale={headerScale}
          headerOpacity={headerOpacity}
        />

        <div className="container mx-auto px-4 max-w-5xl py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-2 space-y-8">
              <ProjectDetailContent project={project} />
            </div>
            <ProjectDetailGallery
              project={project}
              onSelect={setSelectedImage}
            />
          </div>

          <ProjectDetailNavigation prev={prev} next={next} />
        </div>
      </div>

      {selectedImage && (
        <ProjectDetailLightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}