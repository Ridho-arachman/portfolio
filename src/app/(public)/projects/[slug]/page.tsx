import { ProjectDetailPageContent } from "./project-detail-content";
import prisma from "@/lib/prisma";
import { buildMetadata, buildNotFoundMetadata } from "@/lib/seo";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
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
  projects: { slug: string; title: string }[],
  slug: string,
): { prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null } {
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
}: { params: Promise<{ slug: string }> }): Promise<any> {
  const { slug } = await params;
  const project = await fetchProject(slug);

  if (!project) {
    return { title: "Not Found" };
  }

  return {
    title: project.title,
    description: project.description.slice(0, 155),
    openGraph: {
      images: project.thumbnail ? [project.thumbnail] : [],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: { params: Promise<{ slug: string }> }) {
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

  return <ProjectDetailPageContent project={project} prev={prev} next={next} />;
}
