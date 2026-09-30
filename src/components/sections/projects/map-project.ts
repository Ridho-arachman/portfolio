import { localizeProject } from "@/lib/localized-content";
import type { Locale } from "@/lib/i18n";
import type { Project } from "./constants";

interface DbProject {
  id: string | number;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  technologies: string[];
  gallery: string[];
  // Optional fields that may not exist in all Prisma schemas
  liveUrl?: string | null;
  repoUrl?: string | null;
  npmUrl?: string | null;
  role?: string | null;
  year?: string | null;
  highlights?: string[];
  isPublished?: boolean;
  order?: number;
  categoryId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  translations?: unknown;
}

export function mapDbProjectToProject(
  dbProject: DbProject,
  locale: Locale,
): Project {
  const localized = localizeProject(dbProject, locale);

  return {
    id: Number(dbProject.id),
    slug: dbProject.slug,
    title: localized.title,
    description: localized.description,
    image: dbProject.thumbnail,
    tags: dbProject.technologies,
    link: `/projects/${dbProject.slug}`,
    role: localized.role ?? undefined,
    year: dbProject.year ?? undefined,
    gallery: dbProject.gallery,
    highlights: localized.highlights,
    liveUrl: dbProject.liveUrl ?? undefined,
    repoUrl: dbProject.repoUrl ?? undefined,
    npmUrl: dbProject.npmUrl ?? undefined,
  };
}
