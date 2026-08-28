export interface AdminProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  gallery: string[];
  liveUrl?: string;
  repoUrl?: string;
  technologies: string[];
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

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
  fieldTechnologies: "Technologies",
  fieldTechnologiesPlaceholder: "Comma separated: Next.js, Tailwind, Prisma",
  fieldGallery: "Gallery Images",
  fieldGalleryPlaceholder: "Upload images to show in the project gallery",
  fieldIsPublished: "Published",
  fieldOrder: "Order",
  fieldOrderHint: "Lower values appear first.",
} as const;
