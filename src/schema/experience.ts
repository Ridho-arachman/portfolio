import { z } from "zod";
import { relationIdList, relationIds, slugRegex } from "./project";
import { experienceTranslationsSchema } from "./content-translations";

// Client-side form validation for the admin experience form.
export const experienceFormSchema = z.object({
  role: z.string().min(3, "Role must be at least 3 characters"),
  slug: z
    .string()
    .regex(
      slugRegex,
      "Slug: lowercase letters, numbers and hyphens only (e.g. my-role)",
    )
    .max(120, "Slug must be at most 120 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  type: z.enum([
    "WORK",
    "INTERNSHIP",
    "ORGANIZATION",
    "FREELANCE",
    "EDUCATION",
  ]),
  period: z.string().min(2, "Period must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  thumbnail: z.url("Enter a valid image URL"),
  gallery: z.array(z.string()),
  description: z
    .string()
    .refine(
      (value) =>
        value
          .split("\n")
          .some((line) => line.trim().length > 0),
      "Add at least one achievement",
    ),
  projectIds: relationIdList,
  certificateIds: relationIdList,
  isPublished: z.boolean().default(true),
  order: z.number().int().min(0),
  idTitle: z.string().optional(),
  idDescription: z.string().optional(),
});

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

// Server-side payload accepted by POST /api/admin/experience.
export const experienceCreateSchema = z.object({
  slug: z
    .string()
    .regex(slugRegex, "Slug: lowercase letters, numbers and hyphens only")
    .max(120, "Slug must be at most 120 characters")
    .optional(),
  title: z.string().min(3),
  company: z.string().min(2),
  thumbnail: z.string().optional(),
  type: z.enum([
    "WORK",
    "INTERNSHIP",
    "ORGANIZATION",
    "FREELANCE",
    "EDUCATION",
  ]),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.array(z.string()),
  gallery: z.array(z.string()),
  projectIds: relationIds,
  certificateIds: relationIds,
  isPublished: z.boolean().default(true),
  order: z.number().int("Order must be a whole number").min(0),
  translations: experienceTranslationsSchema.optional(),
});

export type ExperienceCreateValues = z.infer<typeof experienceCreateSchema>;

// Server-side payload accepted by PUT /api/admin/experience/[id].
export const experienceUpdateSchema = z.object({
  slug: z
    .string()
    .regex(slugRegex, "Slug: lowercase letters, numbers and hyphens only")
    .max(120, "Slug must be at most 120 characters")
    .optional(),
  title: z.string().min(3).optional(),
  company: z.string().min(2).optional(),
  thumbnail: z.string().optional(),
  type: z
    .enum([
      "WORK",
      "INTERNSHIP",
      "ORGANIZATION",
      "FREELANCE",
      "EDUCATION",
    ])
    .optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  description: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  projectIds: relationIds,
  certificateIds: relationIds,
  order: z.number().int("Order must be a whole number").min(0).optional(),
  translations: experienceTranslationsSchema.optional(),
});

export type ExperienceUpdateValues = z.infer<typeof experienceUpdateSchema>;
