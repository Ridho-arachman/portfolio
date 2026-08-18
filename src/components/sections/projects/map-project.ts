import type { Project } from "./constants";

interface DbProject {
  id: string | number;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  technologies: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  gallery: string[];
  role: string | null;
  year: string | null;
  highlights: string[];
  isPublished: boolean;
  order: number;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function mapDbProjectToProject(dbProject: DbProject): Project {
  return {
    id: Number(dbProject.id),
    slug: dbProject.slug,
    title: dbProject.title,
    description: dbProject.description,
    image: dbProject.thumbnail,
    tags: dbProject.technologies,
    link: `/projects/${dbProject.slug}`,
    role: dbProject.role ?? undefined,
    year: dbProject.year ?? undefined,
    gallery: dbProject.gallery,
    highlights: dbProject.highlights,
  };
}
