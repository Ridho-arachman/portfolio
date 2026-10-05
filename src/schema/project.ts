import { z } from "zod";
import { projectTranslationsSchema } from "./content-translations";

// Single shared slug pattern — source of truth for client + server schemas.
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Single shared shape of the many-to-many id lists on admin payloads
 * (Project↔Certificate, Project↔Experience). All three models import it so a
 * malformed entry cannot be legal on one schema and rejected on another.
 *
 * `min(1)` per element, not just `array()`: the ids become `connect`/`set`
 * arguments, so an empty string would be a real query value, not a no-op.
 */
export const relationIdList = z.array(
  z.string().min(1, "Relation ids cannot be empty"),
);

/** Optional variant for the create/update payloads, where a missing key means
 *  "leave the relation untouched". */
export const relationIds = relationIdList.optional();

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
  highlights: z.string().optional(),
  role: z.string().optional(),
  year: z.string().optional(),
  gallery: z.array(z.string()),
  categoryId: z.string().min(1, "Category is required"),
  certificateIds: relationIdList,
  experienceIds: relationIdList,
  isPublished: z.boolean(),
  order: z.coerce.number().int("Order must be a whole number").min(0),
  idTitle: z.string().optional(),
  idDescription: z.string().optional(),
  idRole: z.string().optional(),
  idHighlights: z.string().optional(),
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
  // Kolomnya NOT NULL di DB: kalau dikirim, harus menunjuk kategori yang ada.
  // Absen = biarkan kategori yang tersimpan.
  categoryId: z
    .string({ error: "Category is required" })
    .min(1, "Category is required")
    .optional(),
  certificateIds: relationIds,
  experienceIds: relationIds,
  translations: projectTranslationsSchema.optional(),
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
  // Wajib: tepat satu kategori per project (kolom NOT NULL + `Restrict`).
  // `error` di level type supaya key yang hilang memberi pesan yang sama
  // dengan string kosong, bukan "expected string, received undefined".
  categoryId: z
    .string({ error: "Category is required" })
    .min(1, "Category is required"),
  certificateIds: relationIds,
  experienceIds: relationIds,
  translations: projectTranslationsSchema.optional(),
});

export type ProjectCreateValues = z.infer<typeof projectCreateSchema>;
