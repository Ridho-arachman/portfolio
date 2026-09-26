export const TRASH_ENTITY_KEYS = [
  "projects",
  "categories",
  "skills",
  "experience",
  "certificates",
  "messages",
] as const;

export type TrashEntityKey = (typeof TRASH_ENTITY_KEYS)[number];

type TrashPrimaryField = "title" | "name" | "subject";
type TrashSecondaryField = "slug" | "company" | "issuer" | "email";

export interface TrashEntity {
  label: string;
  // Query key list admin yang normal. Restore wajib menginvalidasi ini supaya
  // baris yang dikembalikan benar-benar muncul lagi di list aslinya.
  listQueryKey: string;
  primaryField: TrashPrimaryField;
  secondaryField: TrashSecondaryField | null;
}

// Server mengembalikan model utuh tanpa `select`, jadi baris di trash selalu
// punya `deletedAt` (ISO string) dan `createdAt`. Field display tidak seragam
// antar enam entitas, jadi yang dipakai UI dideklarasikan opsional di sini.
export interface TrashRow {
  id: string;
  deletedAt: string | null;
  createdAt: string;
  title?: string;
  name?: string;
  subject?: string;
  slug?: string;
  company?: string;
  issuer?: string;
  email?: string;
}

export const TRASH_ENTITIES: Record<TrashEntityKey, TrashEntity> = {
  projects: {
    label: "Projects",
    listQueryKey: "admin-projects",
    primaryField: "title",
    secondaryField: "slug",
  },
  categories: {
    label: "Categories",
    listQueryKey: "admin-categories",
    primaryField: "name",
    secondaryField: "slug",
  },
  skills: {
    label: "Skills",
    listQueryKey: "admin-skills",
    primaryField: "name",
    secondaryField: null,
  },
  experience: {
    label: "Experience",
    listQueryKey: "admin-experiences",
    primaryField: "title",
    secondaryField: "company",
  },
  certificates: {
    label: "Certificates",
    listQueryKey: "admin-certificates",
    primaryField: "title",
    secondaryField: "issuer",
  },
  messages: {
    label: "Messages",
    listQueryKey: "admin-messages",
    primaryField: "subject",
    secondaryField: "email",
  },
};

export const ADMIN_TRASH = {
  title: "Trash",
  subtitle: "Everything you deleted, kept until you restore or purge it.",
  actionNote:
    "Restoring puts a row back in its normal list. Purging destroys it for good and frees the unique name it was holding, so you can reuse it.",
  allLabel: "All",
  searchPlaceholder: "Search trash...",
  emptyTitle: "Trash is empty",
  emptyNote:
    "Deleted projects, categories, skills, experience, certificates and messages land here.",
  emptyFilteredTitle: "Nothing matches",
  emptyFilteredNote: "Try another search, or pick a different kind of content.",
  restoreLabel: "Restore",
  restoredToast: "Restored to its list",
  restoreFailedToast: "Failed to restore",
  purgeLabel: "Delete forever",
  purgeConfirmTitle: "Delete forever?",
  purgeConfirmDescription:
    "This row is destroyed permanently and cannot be brought back. Purging also frees the unique name it was holding, so you can reuse it.",
  purgeConfirmLabel: "Yes, delete forever",
  purgeSuccessToast: "Deleted forever",
  purgeFailedToast: "Failed to delete",
  errorTitle: "Failed to load the trash",
  errorNote: "Something went wrong while fetching trashed content.",
  retryLabel: "Retry",
  deletedAtLabel: "Deleted",
} as const;
