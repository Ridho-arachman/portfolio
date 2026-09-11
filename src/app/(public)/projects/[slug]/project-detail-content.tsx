"use client";

import { Providers } from "@/lib/providers";
import { ProjectDetail } from "@/components/sections/project-detail";
import type { Project } from "@/components/sections/projects/constants";

interface ProjectDetailPageContentProps {
  project: Project;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export function ProjectDetailPageContent({ project, prev, next }: ProjectDetailPageContentProps) {
  return (
    <Providers>
      <ProjectDetail project={project} prev={prev as any} next={next as any} />
    </Providers>
  );
}
