import { z } from "zod";

// Client-side form validation for the admin category form.
export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug: lowercase letters, numbers and hyphens only (e.g. web-dev)",
    ),
  description: z.union([z.string().min(1), z.literal("")]).optional(),
  order: z.coerce.number().int("Order must be a whole number").min(0),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Server-side payload accepted by POST /api/admin/categories.
export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  order: z.number(),
});

export type CategoryCreateValues = z.infer<typeof categoryCreateSchema>;

// Server-side payload accepted by PUT /api/admin/categories/[id].
export const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
});

export type CategoryUpdateValues = z.infer<typeof categoryUpdateSchema>;
