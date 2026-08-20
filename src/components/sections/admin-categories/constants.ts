import { z } from "zod";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

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

export const ADMIN_CATEGORIES = {
  title: "Categories",
  subtitle: "Organize projects into categories.",
  addLabel: "Add Category",
  addTitle: "New Category",
  editTitle: "Edit Category",
  searchPlaceholder: "Search categories...",
  emptyTitle: "No categories found",
  emptyNote: "Try a different search or add a new category.",
  backLabel: "Back to Categories",
  saveLabel: "Save Category",
  savingLabel: "Saving...",
  deleteLabel: "Delete",
  deleteConfirmLabel: "Sure?",
  editLabel: "Edit",
  notFoundTitle: "Category not found",
  notFoundNote: "The category you are looking for does not exist.",
  fieldName: "Name",
  fieldNamePlaceholder: "e.g. Web Development",
  fieldSlug: "Slug",
  fieldSlugPlaceholder: "e.g. web-dev",
  fieldDescription: "Description (optional)",
  fieldDescriptionPlaceholder: "Short description of this category.",
  fieldOrder: "Order",
  fieldOrderHint: "Lower values appear first.",
} as const;
