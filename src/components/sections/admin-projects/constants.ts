import { z } from "zod";
import { FEATURED_PROJECTS } from "@/components/sections/projects/constants";

export interface AdminProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  liveUrl?: string;
  repoUrl?: string;
  technologies: string[];
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const projectFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug: lowercase letters, numbers and hyphens only (e.g. my-project)",
    ),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnail: z.url("Enter a valid image URL"),
  liveUrl: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  repoUrl: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  technologies: z.string(),
  isPublished: z.boolean(),
  order: z.coerce.number().int("Order must be a whole number").min(0),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const ADMIN_PROJECTS = {
  title: "Projects",
  subtitle: "Manage your portfolio projects.",
  addLabel: "Add Project",
  addTitle: "New Project",
  editTitle: "Edit Project",
  searchPlaceholder: "Search projects...",
  emptyTitle: "No projects found",
  emptyNote: "Try a different search or add a new project.",
  backLabel: "Back to Projects",
  saveLabel: "Save Project",
  savingLabel: "Saving...",
  deleteLabel: "Delete",
  deleteConfirmLabel: "Sure?",
  editLabel: "Edit",
  publishedLabel: "Published",
  draftLabel: "Draft",
  resetLabel: "Reset data",
  resetConfirmLabel: "Reset all?",
  notFoundTitle: "Project not found",
  notFoundNote: "The project you are looking for does not exist.",
  savedTitle: "Project saved",
  savedNote: "Redirecting back to the project list...",
  fieldTitle: "Title",
  fieldTitlePlaceholder: "e.g. Web3 Portfolio Platform",
  fieldSlug: "Slug",
  fieldSlugPlaceholder: "e.g. web3-portfolio",
  fieldDescription: "Description",
  fieldDescriptionPlaceholder: "Short description shown on the project card.",
  fieldThumbnail: "Thumbnail URL",
  fieldThumbnailPlaceholder: "https://images.example.com/cover.jpg",
  fieldLiveUrl: "Live URL (optional)",
  fieldLiveUrlPlaceholder: "https://example.com",
  fieldRepoUrl: "Repository URL (optional)",
  fieldRepoUrlPlaceholder: "https://github.com/user/repo",
  fieldTechnologies: "Technologies",
  fieldTechnologiesPlaceholder: "Comma separated: Next.js, Tailwind, Prisma",
  fieldIsPublished: "Published",
  fieldOrder: "Order",
  fieldOrderHint: "Lower values appear first.",
  mockNote: "Mockup — data disimpan di localStorage, integrasi backend menyusul.",
} as const;

const SEED_CREATED_AT = "2026-07-01T00:00:00.000Z";

export const SEED_PROJECTS: AdminProject[] = FEATURED_PROJECTS.map(
  (project, index) => ({
    id: String(project.id),
    slug: project.slug,
    title: project.title,
    description: project.description,
    thumbnail: project.image,
    liveUrl: project.link,
    technologies: [...project.tags],
    isPublished: true,
    order: index,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
  }),
);
