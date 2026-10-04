import {
  type AdminExperience,
  type ExperienceType,
} from "@/types/domain";

// UI-specific experience types with display labels
export const EXPERIENCE_TYPES = [
  { value: "WORK", label: "Work", badgeClass: "bg-accent-muted text-accent" },
  {
    value: "INTERNSHIP",
    label: "Internship",
    badgeClass: "bg-rose-500/10 text-rose-400",
  },
  {
    value: "ORGANIZATION",
    label: "Organization",
    badgeClass: "bg-sky-500/10 text-sky-400",
  },
  {
    value: "FREELANCE",
    label: "Freelance",
    badgeClass: "bg-amber-500/10 text-amber-400",
  },
  {
    value: "EDUCATION",
    label: "Education",
    badgeClass: "bg-emerald-500/10 text-emerald-400",
  },
] as const;

export { type AdminExperience, type ExperienceType };

/** Bentuk `GET /api/admin/experience/[id]`: baris experience plus daftar tautan
 *  m-n yang dibutuhkan form admin untuk prefill multi-select. */
export type AdminExperienceWithRelations = AdminExperience & {
  projects: { id: string; title: string }[];
  certificates: { id: string; title: string }[];
};

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
    galleryLabel: "Gallery Images",
    galleryPlaceholder: "Upload images to show in the experience gallery",
    descriptionLabel: "Description (one bullet per line)",
    descriptionPlaceholder: "Led frontend team\nBuilt dashboard with React",
    projectsLabel: "Projects",
    searchProjects: "Search projects...",
    noProjects: "No projects available yet.",
    certificatesLabel: "Certificates",
    searchCertificates: "Search certificates...",
    noCertificates: "No certificates available yet.",
    isPublishedLabel: "Published",
    isPublishedDescription: "Visible on public site when enabled",
    orderLabel: "Display Order",
    orderPlaceholder: "0",
    idSectionLabel: "Bahasa Indonesia (opsional)",
    idSectionNote: "Leave blank to auto-translate from English.",
    idTitleLabel: "Role (ID)",
    idTitlePlaceholder: "e.g. Frontend Developer",
    idDescriptionLabel: "Description (ID, satu poin per baris)",
    idDescriptionPlaceholder: "Memimpin tim frontend\nMembangun dashboard dengan React",
    submitCreate: "Create Experience",
    submitUpdate: "Save Changes",
    backToList: "Back to List",
  },
} as const;