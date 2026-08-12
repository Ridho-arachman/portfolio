"use client";

import { useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import * as m from "motion/react-m";
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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <>
      <div ref={containerRef} className="min-h-screen bg-bg-primary overflow-hidden">
        <ProjectDetailHero
          project={project}
          headerY={headerY}
          headerScale={headerScale}
          headerOpacity={headerOpacity}
        />

        <div className="container relative mx-auto px-4 max-w-5xl py-16 md:py-24">
          <m.div
            style={{ y: bgY1 }}
            className="absolute top-20 right-0 w-100 h-100 bg-accent/5 rounded-full blur-[120px] pointer-events-none"
          />
          <m.div
            style={{ y: bgY2 }}
            className="absolute bottom-20 left-0 w-125 h-125 bg-white/5 rounded-full blur-[120px] pointer-events-none"
          />

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