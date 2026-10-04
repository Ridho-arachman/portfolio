export { type AdminCertificate } from "@/types/domain";

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
  fieldExpiryDate: "Expiry Date (optional)",
  fieldExpiryDatePlaceholder: "Leave empty if it never expires",
  issuedLabel: "Issued on",
  expiresLabel: "Expires on",
  fieldCredentialId: "Credential ID (optional)",
  fieldCredentialIdPlaceholder: "e.g. AWS-CP-8F3K2Q1X",
  fieldCredentialUrl: "Credential URL (optional)",
  fieldCredentialUrlPlaceholder: "https://www.credly.com/",
  fieldThumbnail: "Thumbnail URL",
  fieldThumbnailPlaceholder: "https://images.example.com/cover.jpg",
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
  idSectionLabel: "Bahasa Indonesia (opsional)",
  idSectionNote: "Leave blank to auto-translate from English.",
  fieldIdTitle: "Title (ID)",
  fieldIdTitlePlaceholder: "e.g. AWS Certified Cloud Practitioner",
  fieldIdSummary: "Summary (ID, satu poin per baris)",
  fieldIdSummaryPlaceholder:
    "Satu poin per baris.\nIni tampil di halaman detail sertifikat.",
} as const;

const monthYear = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
});

/**
 * Mirrors the public `formatPeriod` in components/sections/certificates. Kept
 * local because the admin is single-locale and owns its own copy strings.
 */
export function formatCertificatePeriod(
  issueDate: string,
  expiryDate: string | null,
): string {
  const issued = `${ADMIN_CERTIFICATES.issuedLabel} ${monthYear.format(
    new Date(issueDate),
  )}`;
  if (!expiryDate) return issued;
  return `${issued} · ${ADMIN_CERTIFICATES.expiresLabel} ${monthYear.format(
    new Date(expiryDate),
  )}`;
}

/** Native `<input type="date">` only accepts "YYYY-MM-DD"; Prisma sends ISO. */
export function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}
