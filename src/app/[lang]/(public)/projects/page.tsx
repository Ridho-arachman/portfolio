import { ProjectsPageContent } from "./projects-content";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { getMessages } from "@/lib/translations";
import { Locale, isValidLocale, DEFAULT_LOCALE, getAlternatePaths } from "@/lib/i18n";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

interface ProjectsPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const messages = await getMessages(isValidLocale(locale) ? locale : DEFAULT_LOCALE);
  const alternates = getAlternatePaths('/projects');

  return {
    title: messages.projects.title,
    description: messages.projects.subtitle,
    alternates: {
      languages: alternates,
    },
    openGraph: {
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      alternateLocale: locale === 'id' ? 'en_US' : 'id_ID',
    },
  };
}

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

const getProjects = unstable_cache(
  async () => {
    return prisma.project.findMany({
      where: { isPublished: true, ...notDeleted },
      orderBy: { order: "asc" },
      // `include: { category: true }` menarik `deletedAt` ke payload cache dan
      // kolom Date kembali jadi string setelah warm. Insiden 86d09b0.
      include: {
        category: { where: notDeleted, select: { id: true, name: true } },
      },
    });
  },
  ["public-projects"],
  { revalidate: 3600, tags: ["projects"] },
);

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsPageContent projects={projects} />;
}
