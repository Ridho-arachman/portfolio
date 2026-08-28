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
  logoUrl: string;
  gallery: string[];
  description: string[];
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const ADMIN_EXPERIENCE = {
  // List page
  title: "Experiences",
  subtitle: "Manage your work and organization experiences",
  addLabel: "Add Experience",
  searchPlaceholder: "Search experiences...",
  emptyTitle: "No experiences found",
  emptyNote: "Try a different search or add a new experience.",
  editLabel: "Edit",
  deleteConfirmLabel: "Ya, Hapus",
  deleteConfirmTitle: "Hapus Experience?",
  deleteConfirmDescription: "Experience akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.",
  deleteLabel: "Delete",

  // Form page
  notFoundTitle: "Experience not found",
  notFoundNote: "The experience you are looking for does not exist.",
  backLabel: "Back to Experience",

  // Form fields
  form: {
    roleLabel: "Role",
    rolePlaceholder: "e.g. Frontend Developer",
    slugLabel: "Slug",
    slugPlaceholder: "e.g. frontend-dev",
    companyLabel: "Company / Organization",
    companyPlaceholder: "e.g. Tech Corp",
    typeLabel: "Type",
    periodLabel: "Period",
    periodPlaceholder: "e.g. Jan 2023 - Present",
    locationLabel: "Location",
    locationPlaceholder: "e.g. Jakarta, Indonesia",
    thumbnailLabel: "Thumbnail URL",
    thumbnailPlaceholder: "https://example.com/image.jpg",
    logoUrlLabel: "Logo URL",
    logoUrlPlaceholder: "https://example.com/logo.png",
    galleryLabel: "Gallery Images",
    galleryPlaceholder: "Upload images to show in the experience gallery",
    descriptionLabel: "Description (one bullet per line)",
    descriptionPlaceholder: "Led frontend team\nBuilt dashboard with React",
    isPublishedLabel: "Published",
    isPublishedDescription: "Visible on public site when enabled",
    orderLabel: "Display Order",
    orderPlaceholder: "0",
    submitCreate: "Create Experience",
    submitUpdate: "Save Changes",
    backToList: "Back to List",
  },
} as const;