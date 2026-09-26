import { ProjectDetailPageContent } from "./project-detail-content";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import type { Project } from "@/components/sections/projects/constants";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMessages } from "@/lib/translations";
import { Locale, isValidLocale, DEFAULT_LOCALE } from "@/lib/i18n";

async function fetchProject(slug: string) {
  return prisma.project.findFirst({
    where: { slug, isPublished: true, ...notDeleted },
  });
}

async function fetchAllPublishedProjects() {
  return prisma.project.findMany({
    where: { isPublished: true, ...notDeleted },
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
      where: { isPublished: true, ...notDeleted },
      select: { slug: true },
    });
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isValidLocale(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  const project = await fetchProject(slug);

  if (!project) {
    return { title: messages.projectDetail.notFound };
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
}: { params: Promise<{ lang: string; slug: string }> }) {
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
