import { z } from "zod";
import { slugRegex } from "./project";
import { categoryTranslationsSchema } from "./content-translations";

// Client-side form validation for the admin category form.
export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .regex(
      slugRegex,
      "Slug: lowercase letters, numbers and hyphens only (e.g. web-dev)",
    )
    .max(120, "Slug must be at most 120 characters"),
  description: z.union([z.string().min(1), z.literal("")]).optional(),
  order: z.coerce.number().int("Order must be a whole number").min(0),
  idName: z.string().optional(),
  idDescription: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Server-side payload accepted by POST /api/admin/categories.
export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .regex(slugRegex, "Slug: lowercase letters, numbers and hyphens only")
    .max(120, "Slug must be at most 120 characters")
    .optional(),
  description: z.string().optional(),
  order: z.number(),
  translations: categoryTranslationsSchema.optional(),
});

export type CategoryCreateValues = z.infer<typeof categoryCreateSchema>;

// Server-side payload accepted by PUT /api/admin/categories/[id].
export const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .regex(slugRegex, "Slug: lowercase letters, numbers and hyphens only")
    .max(120, "Slug must be at most 120 characters")
    .optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  translations: categoryTranslationsSchema.optional(),
});

export type CategoryUpdateValues = z.infer<typeof categoryUpdateSchema>;
