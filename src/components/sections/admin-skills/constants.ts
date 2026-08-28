import { SKILL_CATEGORY_VALUES } from "@/schema/skill";

export interface AdminSkill {
  id: string;
  name: string;
  iconName?: string | null;
  category: (typeof SKILL_CATEGORY_VALUES)[number];
  proficiency: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const SKILL_CATEGORIES: ReadonlyArray<{
  value: (typeof SKILL_CATEGORY_VALUES)[number];
  label: string;
}> = [
  { value: "FRONTEND", label: "Frontend" },
  { value: "BACKEND", label: "Backend" },
  { value: "DATABASE", label: "Database" },
  { value: "DEVOPS_TOOLS", label: "DevOps & Tools" },
  { value: "SOFT_SKILL", label: "Soft Skill" },
];

export const ADMIN_SKILLS = {
  title: "Skills",
  subtitle: "Manage the skills shown on your public portfolio.",
  addLabel: "Add Skill",
  addTitle: "New Skill",
  editTitle: "Edit Skill",
  searchPlaceholder: "Search skills...",
  emptyTitle: "No skills found",
  emptyNote: "Try a different search or add a new skill.",
  backLabel: "Back to Skills",
  saveLabel: "Save Skill",
  savingLabel: "Saving...",
  deleteLabel: "Delete",
  deleteConfirmLabel: "Ya, Hapus",
  deleteConfirmTitle: "Hapus Skill?",
  deleteConfirmDescription:
    "Skill akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.",
  editLabel: "Edit",
  notFoundTitle: "Skill not found",
  notFoundNote: "The skill you are looking for does not exist.",
  errorTitle: "Failed to load skills",
  errorNote: "Something went wrong. Please try again later.",
  fieldName: "Name",
  fieldNamePlaceholder: "e.g. Next.js",
  fieldIconName: "Icon Name (optional)",
  fieldIconNamePlaceholder: "SiNextdotjs",
  fieldCategory: "Category",
  fieldProficiency: "Proficiency",
  fieldProficiencyHint: "1-100, used for progress indicators.",
  fieldOrder: "Order",
  fieldOrderHint: "Lower values appear first.",
} as const;
