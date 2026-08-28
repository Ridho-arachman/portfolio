import { z } from "zod";

// Canonical list of skill categories (shared by form, API payload and UI labels).
export const SKILL_CATEGORY_VALUES = [
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "DEVOPS_TOOLS",
  "SOFT_SKILL",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORY_VALUES)[number];

// Client-side form validation for the admin skill form.
export const skillFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  iconName: z.string().optional(),
  category: z.enum(SKILL_CATEGORY_VALUES),
  proficiency: z.coerce
    .number()
    .int("Proficiency must be a whole number")
    .min(1, "Proficiency must be at least 1")
    .max(100, "Proficiency must be at most 100"),
  order: z.coerce.number().int("Order must be a whole number").min(0),
});

export type SkillFormValues = z.infer<typeof skillFormSchema>;

// Server-side payload accepted by POST /api/admin/skills.
export const skillCreateSchema = z.object({
  name: z.string().min(1),
  iconName: z.string().optional(),
  category: z.enum(SKILL_CATEGORY_VALUES),
  proficiency: z.number().min(1).max(100),
  order: z.number(),
});

export type SkillCreateValues = z.infer<typeof skillCreateSchema>;

// Server-side payload accepted by PUT /api/admin/skills/[id].
export const skillUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  iconName: z.string().optional(),
  category: z.enum(SKILL_CATEGORY_VALUES).optional(),
  proficiency: z.number().min(1).max(100).optional(),
  order: z.number().optional(),
});

export type SkillUpdateValues = z.infer<typeof skillUpdateSchema>;
