"use client";

import { ProjectDetail } from "@/components/sections/project-detail";
import { FEATURED_PROJECTS } from "@/components/sections/projects/constants";
import { getAdjacentProjects } from "@/components/sections/project-detail/use-project-detail";
import { notFound } from "next/navigation";
import { use } from "react";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const project = FEATURED_PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const { prev, next } = getAdjacentProjects(FEATURED_PROJECTS, slug);

  return <ProjectDetail project={project} prev={prev} next={next} />;
}