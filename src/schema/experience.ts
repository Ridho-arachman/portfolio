import { z } from "zod";

// Client-side form validation for the admin experience form.
export const experienceFormSchema = z.object({
  role: z.string().min(3, "Role must be at least 3 characters"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug: lowercase letters, numbers and hyphens only (e.g. my-role)",
    ),
  company: z.string().min(2, "Company must be at least 2 characters"),
  type: z.enum(["Work", "Organization", "Freelance"]),
  period: z.string().min(2, "Period must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  thumbnail: z.url("Enter a valid image URL"),
  gallery: z.array(z.string()),
  logoUrl: z.url("Enter a valid image URL").optional().or(z.literal("")),
  description: z
    .string()
    .refine(
      (value) =>
        value
          .split("\n")
          .some((line) => line.trim().length > 0),
      "Add at least one achievement",
    ),
  isPublished: z.boolean().default(true),
  order: z.number().int().min(0),
});

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

// Server-side payload accepted by POST /api/admin/experience.
export const experienceCreateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3),
  company: z.string().min(2),
  logoUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  type: z.enum([
    "WORK",
    "ORGANIZATION",
    "FREELANCE",
    "EDUCATION",
    "CERTIFICATION",
  ]),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.array(z.string()),
  gallery: z.array(z.string()),
  isPublished: z.boolean().default(true),
  order: z.number(),
});

export type ExperienceCreateValues = z.infer<typeof experienceCreateSchema>;

// Server-side payload accepted by PUT /api/admin/experience/[id].
export const experienceUpdateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3).optional(),
  company: z.string().min(2).optional(),
  logoUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  type: z
    .enum(["WORK", "ORGANIZATION", "FREELANCE", "EDUCATION", "CERTIFICATION"])
    .optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  description: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  order: z.number().optional(),
});

export type ExperienceUpdateValues = z.infer<typeof experienceUpdateSchema>;
