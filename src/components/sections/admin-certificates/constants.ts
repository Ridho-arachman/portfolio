import { z } from "zod";

export interface AdminCertificate {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  credentialId?: string;
  credentialUrl?: string;
  issueDate: string;
  period: string;
  thumbnail: string;
  logoUrl: string;
  gallery: string[];
  skills: string[];
  summary: string[];
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

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

export const ADMIN_CERTIFICATES = {
  title: "Certificates",
  subtitle: "Manage your credentials and certifications.",
  addLabel: "Add Certificate",
  addTitle: "New Certificate",
  editTitle: "Edit Certificate",
  searchPlaceholder: "Search certificates...",
  emptyTitle: "No certificates found",
  emptyNote: "Try a different search or add a new certificate.",
  backLabel: "Back to Certificates",
  saveLabel: "Save Certificate",
  savingLabel: "Saving...",
  deleteLabel: "Delete",
  deleteConfirmLabel: "Ya, Hapus",
  deleteConfirmTitle: "Hapus Certificate?",
  deleteConfirmDescription: "Certificate akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.",
  editLabel: "Edit",
  publishedLabel: "Published",
  draftLabel: "Draft",
  verifiedLabel: "Verified",
  notFoundTitle: "Certificate not found",
  notFoundNote: "The certificate you are looking for does not exist.",
  fieldTitle: "Title",
  fieldTitlePlaceholder: "e.g. AWS Certified Cloud Practitioner",
  fieldSlug: "Slug",
  fieldSlugPlaceholder: "e.g. aws-certified-cloud-practitioner",
  fieldIssuer: "Issuer",
  fieldIssuerPlaceholder: "e.g. Amazon Web Services (AWS)",
  fieldIssueDate: "Issue Date",
  fieldIssueDatePlaceholder: "e.g. March 2024",
  fieldPeriod: "Period",
  fieldPeriodPlaceholder: "e.g. Issued Mar 2024 · No Expiration",
  fieldCredentialId: "Credential ID (optional)",
  fieldCredentialIdPlaceholder: "e.g. AWS-CP-8F3K2Q1X",
  fieldCredentialUrl: "Credential URL (optional)",
  fieldCredentialUrlPlaceholder: "https://www.credly.com/",
  fieldThumbnail: "Thumbnail URL",
  fieldThumbnailPlaceholder: "https://images.example.com/cover.jpg",
  fieldLogoUrl: "Logo URL",
  fieldLogoUrlPlaceholder: "https://example.com/logo.png",
  fieldGallery: "Gallery Images",
  fieldGalleryPlaceholder: "Upload images to show in the certificate gallery",
  fieldSkills: "Skills",
  fieldSkillsPlaceholder: "Comma separated: Cloud Computing, AWS, Architecture",
  fieldSummary: "Summary",
  fieldSummaryPlaceholder:
    "One point per line.\nThese render on the certificate detail page.",
  fieldSummaryHint: "One point per line — rendered on the detail page.",
  fieldIsPublished: "Published",
  fieldOrder: "Order",
  fieldOrderHint: "Lower values appear first.",
} as const;
