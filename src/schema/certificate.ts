import { z } from "zod";

// Client-side form validation for the admin certificate form.
export const certificateFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug: lowercase letters, numbers and hyphens only (e.g. my-certificate)",
    ),
  issuer: z.string().min(2, "Issuer must be at least 2 characters"),
  issueDate: z.string().min(3, "Issue date must be at least 3 characters"),
  period: z.string().min(2, "Period must be at least 2 characters"),
  credentialId: z.union([z.string().min(1), z.literal("")]).optional(),
  credentialUrl: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  thumbnail: z.url("Enter a valid image URL"),
  logoUrl: z.url("Enter a valid image URL").optional().or(z.literal("")),
  gallery: z.array(z.string()),
  skills: z.string(),
  summary: z
    .string()
    .refine(
      (value) => value.split("\n").some((line) => line.trim().length > 0),
      "Add at least one summary point",
    ),
  isPublished: z.boolean(),
  order: z.coerce.number().int("Order must be a whole number").min(0),
});

export type CertificateFormValues = z.infer<typeof certificateFormSchema>;

// Server-side payload accepted by POST /api/admin/certificates.
export const certificateCreateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3),
  issuer: z.string().min(2),
  logoUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  skills: z.array(z.string()),
  summary: z.array(z.string()),
  isPublished: z.boolean(),
  order: z.number(),
});

export type CertificateCreateValues = z.infer<typeof certificateCreateSchema>;

// Server-side payload accepted by PUT /api/admin/certificates/[id].
export const certificateUpdateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3).optional(),
  issuer: z.string().min(2).optional(),
  logoUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  skills: z.array(z.string()).optional(),
  summary: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  order: z.number().optional(),
});

export type CertificateUpdateValues = z.infer<typeof certificateUpdateSchema>;
