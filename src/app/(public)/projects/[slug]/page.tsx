import { ProjectDetail } from "@/components/sections/project-detail";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import type { Project } from "@/components/sections/projects/constants";
import prisma from "@/lib/prisma";
import { buildMetadata, buildNotFoundMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { notFound } from "next/navigation";

async function fetchProject(slug: string) {
  return prisma.project.findFirst({
    where: { slug, isPublished: true },
  });
}

async function fetchAllPublishedProjects() {
  return prisma.project.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });
}

function getAdjacentProjects(
  projects: Project[],
  slug: string,
): { prev: Project | null; next: Project | null } {
  const index = projects.findIndex((p) => p.slug === slug);
  return {
    prev: index > 0 ? projects[index - 1] : null,
    next: index < projects.length - 1 ? projects[index + 1] : null,
  };
}

export async function generateStaticParams() {
  try {
    const projects = await prisma.project.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProject(slug);

  if (!project) {
    return buildNotFoundMetadata("Project");
  }

  return buildMetadata({
    title: project.title,
    description: project.description.slice(0, 155),
    path: `/projects/${slug}`,
    ogImage: project.thumbnail || undefined,
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [dbProject, allDbProjects] = await Promise.all([
    fetchProject(slug),
    fetchAllPublishedProjects(),
  ]);

  if (!dbProject) {
    notFound();
  }

  const project = mapDbProjectToProject(dbProject);
  const allProjects = allDbProjects.map(mapDbProjectToProject);
  const { prev, next } = getAdjacentProjects(allProjects, slug);

  return <ProjectDetail project={project} prev={prev} next={next} />;
}
