"use client";

import { Providers } from "@/lib/providers";
import { ProjectDetail } from "@/components/sections/project-detail";
import type { Project } from "@/components/sections/projects/constants";

interface ProjectDetailPageContentProps {
  project: Project;
  prev: Project | null;
  next: Project | null;
}

export function ProjectDetailPageContent({ project, prev, next }: ProjectDetailPageContentProps) {
  return (
    <Providers>
      <ProjectDetail project={project} prev={prev} next={next} />
    </Providers>
  );
}
