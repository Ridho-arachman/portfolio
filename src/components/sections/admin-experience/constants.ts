import { z } from "zod";
import { EXPERIENCES_LIST } from "@/components/sections/experience-list/constants";

export const EXPERIENCE_TYPES = [
  { value: "Work", label: "Work", badgeClass: "bg-accent-muted text-accent" },
  {
    value: "Organization",
    label: "Organization",
    badgeClass: "bg-sky-500/10 text-sky-400",
  },
  {
    value: "Freelance",
    label: "Freelance",
    badgeClass: "bg-amber-500/10 text-amber-400",
  },
] as const;

export type ExperienceType = (typeof EXPERIENCE_TYPES)[number]["value"];

export interface AdminExperience {
  id: string;
  slug: string;
  role: string;
  company: string;
  type: ExperienceType;
  period: string;
  location: string;
  thumbnail: string;
  gallery: string[];
  description: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

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
  gallery: z
    .string()
    .refine(
      (value) =>
        value
          .split("\n")
          .every(
            (line) => line.trim() === "" || z.url().safeParse(line.trim()).success,
          ),
      "Each gallery line must be a valid URL",
    ),
  description: z
    .string()
    .refine(
      (value) =>
        value.split("\n").some((line) => line.trim().length > 0),
      "Add at least one achievement",
    ),
  order: z.coerce.number().int("Order must be a whole number").min(0),
});

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export const ADMIN_EXPERIENCE = {
  title: "Experience",
  subtitle: "Manage your work experience timeline.",
  addLabel: "Add Experience",
  addTitle: "New Experience",
  editTitle: "Edit Experience",
  searchPlaceholder: "Search experiences...",
  emptyTitle: "No experiences found",
  emptyNote: "Try a different search or add a new experience.",
  backLabel: "Back to Experience",
  saveLabel: "Save Experience",
  savingLabel: "Saving...",
  deleteLabel: "Delete",
  deleteConfirmLabel: "Sure?",
  editLabel: "Edit",
  resetLabel: "Reset data",
  resetConfirmLabel: "Reset all?",
  notFoundTitle: "Experience not found",
  notFoundNote: "The experience you are looking for does not exist.",
  fieldRole: "Role / Title",
  fieldRolePlaceholder: "e.g. Frontend Developer Intern",
  fieldSlug: "Slug",
  fieldSlugPlaceholder: "e.g. frontend-developer-intern",
  fieldCompany: "Company / Organization",
  fieldCompanyPlaceholder: "e.g. PT Tech Startup Indonesia",
  fieldType: "Type",
  fieldPeriod: "Period",
  fieldPeriodPlaceholder: "e.g. Jan 2024 - Present",
  fieldLocation: "Location",
  fieldLocationPlaceholder: "e.g. Jakarta, Indonesia (Remote)",
  fieldThumbnail: "Thumbnail URL",
  fieldThumbnailPlaceholder: "https://images.example.com/cover.jpg",
  fieldGallery: "Gallery (optional)",
  fieldGalleryPlaceholder:
    "One image URL per line.\nhttps://images.example.com/1.jpg\nhttps://images.example.com/2.jpg",
  fieldGalleryHint: "One image URL per line.",
  fieldDescription: "Achievements",
  fieldDescriptionPlaceholder:
    "One achievement per line.\nThese render as bullet points on the timeline.",
  fieldDescriptionHint: "One achievement per line — rendered as bullet points.",
  fieldOrder: "Order",
  fieldOrderHint: "Lower values appear first.",
  mockNote: "Mockup — data disimpan di localStorage, integrasi backend menyusul.",
} as const;

const SEED_CREATED_AT = "2026-07-01T00:00:00.000Z";

export const SEED_EXPERIENCES: AdminExperience[] = EXPERIENCES_LIST.map(
  (exp, index) => ({
    id: String(exp.id),
    slug: exp.slug,
    role: exp.role,
    company: exp.company,
    type: exp.type,
    period: exp.period,
    location: exp.location,
    thumbnail: exp.thumbnail,
    gallery: exp.gallery ?? [],
    description: [...exp.description],
    order: index,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
  }),
);
