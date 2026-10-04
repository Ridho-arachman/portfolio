import type { AdminProject } from "@/types/domain";

export type { AdminProject };

/**
 * Bentuk `GET /api/admin/projects/[id]`: baris project plus dua daftar tautan
 * m-n yang dibutuhkan form admin untuk prefill multi-select.
 */
export type AdminProjectWithRelations = AdminProject & {
  certificates: { id: string; title: string }[];
  experiences: { id: string; title: string }[];
};

/** Dipakai `ProjectForm.onSubmit`; dipisah dari `AdminProject` karena id
 *  relasi tidak pernah ikut disimpan sebagai kolom, dan `categoryId` di sini
 *  bukan `string | null` karena form mewajibkan satu kategori. */
export type ProjectFormPayload = Omit<
  AdminProject,
  "id" | "createdAt" | "updatedAt" | "categoryId"
> & {
  categoryId: string;
  certificateIds: string[];
  experienceIds: string[];
};

export const ADMIN_PROJECTS = {
  title: "Projects",
  subtitle: "Manage your portfolio projects.",
  addLabel: "Add Project",
  addTitle: "New Project",
  editTitle: "Edit Project",
  searchPlaceholder: "Search projects...",
  emptyTitle: "No projects found",
  emptyNote: "Try a different search or add a new project.",
  backLabel: "Back to Projects",
  saveLabel: "Save Project",
  savingLabel: "Saving...",
  deleteLabel: "Delete",
  deleteConfirmLabel: "Ya, Hapus",
  deleteConfirmTitle: "Hapus Project?",
  deleteConfirmDescription: "Project akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.",
  editLabel: "Edit",
  publishedLabel: "Published",
  draftLabel: "Draft",
  notFoundTitle: "Project not found",
  notFoundNote: "The project you are looking for does not exist.",
  savedTitle: "Project saved",
  savedNote: "Redirecting back to the project list...",
  errorTitle: "Failed to load projects",
  errorNote: "Something went wrong. Please try again later.",
  fieldTitle: "Title",
  fieldTitlePlaceholder: "e.g. Web3 Portfolio Platform",
  fieldSlug: "Slug",
  fieldSlugPlaceholder: "e.g. web3-portfolio",
  fieldDescription: "Description",
  fieldDescriptionPlaceholder: "Short description shown on the project card.",
  fieldThumbnail: "Thumbnail URL",
  fieldThumbnailPlaceholder: "https://images.example.com/cover.jpg",
  fieldLiveUrl: "Live URL (optional)",
  fieldLiveUrlPlaceholder: "https://example.com",
  fieldRepoUrl: "Repository URL (optional)",
  fieldRepoUrlPlaceholder: "https://github.com/user/repo",
  fieldNpmUrl: "npm URL (optional)",
  fieldNpmUrlPlaceholder: "https://www.npmjs.com/package/user-repo",
  fieldTechnologies: "Technologies",
  fieldTechnologiesPlaceholder: "Comma separated: Next.js, Tailwind, Prisma",
  fieldCategory: "Category",
  fieldCategoryPlaceholder: "Select a category...",
  fieldCategoryHint: "Every project belongs to exactly one category.",
  fieldCertificates: "Certificates",
  searchCertificates: "Search certificates...",
  noCertificates: "No certificates available yet.",
  fieldExperiences: "Experiences",
  searchExperiences: "Search experiences...",
  noExperiences: "No experiences available yet.",
  fieldGallery: "Gallery Images",
  fieldGalleryPlaceholder: "Upload images to show in the project gallery",
  fieldIsPublished: "Published",
  fieldOrder: "Order",
  fieldOrderHint: "Lower values appear first.",
  idSectionLabel: "Bahasa Indonesia (opsional)",
  idSectionNote: "Leave blank to auto-translate from English.",
  fieldIdTitle: "Title (ID)",
  fieldIdTitlePlaceholder: "e.g. Platform Portfolio Web3",
  fieldIdDescription: "Description (ID)",
  fieldIdDescriptionPlaceholder: "Deskripsi singkat yang tampil di kartu proyek.",
  fieldIdRole: "Role (ID)",
  fieldIdRolePlaceholder: "e.g. Frontend Developer",
  fieldIdHighlights: "Highlights (ID, satu poin per baris)",
  fieldIdHighlightsPlaceholder: "Merilis ke produksi\nMemimpin tim frontend",
} as const;
