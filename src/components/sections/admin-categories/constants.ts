export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

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
  deleteConfirmLabel: "Ya, Hapus",
  deleteConfirmTitle: "Hapus Category?",
  deleteConfirmDescription: "Category akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.",
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
