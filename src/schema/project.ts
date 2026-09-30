import { z } from "zod";

// Single shared slug pattern — source of truth for client + server schemas.
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Client-side form validation for the admin project form.
export const projectFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .regex(
      slugRegex,
      "Slug: lowercase letters, numbers and hyphens only (e.g. my-project)",
    )
    .max(120, "Slug must be at most 120 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnail: z.url("Enter a valid image URL"),
  liveUrl: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  repoUrl: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  npmUrl: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  technologies: z.string(),
  gallery: z.array(z.string()),
  isPublished: z.boolean(),
  order: z.coerce.number().int("Order must be a whole number").min(0),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Server-side payload accepted by PUT /api/admin/projects/[id].
export const projectUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z
    .string()
    .regex(slugRegex, "Slug: lowercase letters, numbers and hyphens only")
    .max(120, "Slug must be at most 120 characters")
    .optional(),
  description: z.string().min(10).optional(),
  thumbnail: z.string().url().optional(),
  liveUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  npmUrl: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  role: z.string().optional(),
  year: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  order: z.number().int("Order must be a whole number").min(0).optional(),
  categoryId: z.string().optional(),
});

export type ProjectUpdateValues = z.infer<typeof projectUpdateSchema>;

// Server-side payload accepted by POST /api/admin/projects.
export const projectCreateSchema = z.object({
  title: z.string().min(3),
  slug: z
    .string()
    .regex(slugRegex, "Slug: lowercase letters, numbers and hyphens only")
    .max(120, "Slug must be at most 120 characters")
    .optional(),
  description: z.string().min(10),
  thumbnail: z.string().url(),
  liveUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  npmUrl: z.string().optional(),
  technologies: z.array(z.string()),
  gallery: z.array(z.string()),
  role: z.string().optional(),
  year: z.string().optional(),
  highlights: z.array(z.string()),
  isPublished: z.boolean(),
  order: z.number().int("Order must be a whole number").min(0),
  categoryId: z.string().optional(),
});

export type ProjectCreateValues = z.infer<typeof projectCreateSchema>;
