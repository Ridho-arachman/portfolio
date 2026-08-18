import { ProjectDetail } from "@/components/sections/project-detail";
import { getAdjacentProjects } from "@/components/sections/project-detail/use-project-detail";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";

function fetchProject(slug: string) {
  return prisma.project.findFirst({
    where: { slug, isPublished: true },
  });
}

function fetchAllPublishedProjects() {
  return prisma.project.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });
}

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProject(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: `${project.title} | Ridho.dev`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [{ url: project.thumbnail, width: 800, height: 600 }],
    },
  };
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
