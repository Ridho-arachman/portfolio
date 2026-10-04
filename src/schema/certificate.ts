import { z } from "zod";
import { slugRegex } from "./project";
import { certificateTranslationsSchema } from "./content-translations";

// z.url() accepts every scheme the URL parser understands (javascript:, data:,
// ftp:) unless a protocol is given, and both `credentialUrl` and `thumbnail` end
// up in an href/src — so pin them to http(s). The regex omits the trailing colon
// because Zod strips it from URL.protocol before matching.
const httpProtocol = /^https?$/;

// Both admin routes pass these straight to `new Date()`, so reject Invalid Date.
const dateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date");
const optionalDateString = z
  .string()
  .refine(
    (value) => value === "" || !Number.isNaN(Date.parse(value)),
    "Enter a valid date",
  );

// Client-side form validation for the admin certificate form.
export const certificateFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .regex(
      slugRegex,
      "Slug: lowercase letters, numbers and hyphens only (e.g. my-certificate)",
    )
    .max(120, "Slug must be at most 120 characters"),
  issuer: z.string().min(2, "Issuer must be at least 2 characters"),
  issueDate: dateString,
  expiryDate: optionalDateString.optional(),
  credentialId: z.union([z.string().min(1), z.literal("")]).optional(),
  credentialUrl: z
    .union([
      z.url({ protocol: httpProtocol, message: "Enter a valid URL" }),
      z.literal(""),
    ])
    .optional(),
  thumbnail: z.url({
    protocol: httpProtocol,
    message: "Enter a valid image URL",
  }),
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
  idTitle: z.string().optional(),
  idSummary: z.string().optional(),
});

export type CertificateFormValues = z.infer<typeof certificateFormSchema>;

// Server-side payload accepted by POST /api/admin/certificates.
export const certificateCreateSchema = z.object({
  slug: z
    .string()
    .regex(slugRegex, "Slug: lowercase letters, numbers and hyphens only")
    .max(120, "Slug must be at most 120 characters")
    .optional(),
  title: z.string().min(3),
  issuer: z.string().min(2),
  thumbnail: z
    .url({ protocol: httpProtocol, message: "Enter a valid image URL" })
    .optional(),
  gallery: z.array(z.string()).optional(),
  credentialId: z.string().optional(),
  credentialUrl: z
    .url({ protocol: httpProtocol, message: "Enter a valid URL" })
    .optional(),
  issueDate: dateString,
  expiryDate: optionalDateString.optional(),
  skills: z.array(z.string()),
  summary: z.array(z.string()),
  isPublished: z.boolean(),
  order: z.number().int("Order must be a whole number").min(0),
  translations: certificateTranslationsSchema.optional(),
});

export type CertificateCreateValues = z.infer<typeof certificateCreateSchema>;

// Server-side payload accepted by PUT /api/admin/certificates/[id].
export const certificateUpdateSchema = z.object({
  slug: z
    .string()
    .regex(slugRegex, "Slug: lowercase letters, numbers and hyphens only")
    .max(120, "Slug must be at most 120 characters")
    .optional(),
  title: z.string().min(3).optional(),
  issuer: z.string().min(2).optional(),
  thumbnail: z
    .url({ protocol: httpProtocol, message: "Enter a valid image URL" })
    .optional(),
  gallery: z.array(z.string()).optional(),
  credentialId: z.string().optional(),
  credentialUrl: z
    .url({ protocol: httpProtocol, message: "Enter a valid URL" })
    .optional(),
  issueDate: dateString.optional(),
  expiryDate: optionalDateString.optional(),
  skills: z.array(z.string()).optional(),
  summary: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  order: z.number().int("Order must be a whole number").min(0).optional(),
  translations: certificateTranslationsSchema.optional(),
});

export type CertificateUpdateValues = z.infer<typeof certificateUpdateSchema>;
