import { z } from "zod";

import type { DEFAULT_QUICK_LINK_KEYS } from "@/lib/settings";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const socialsSchema = z.object({
  github: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  linkedin: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  x: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  email: z
    .union([z.email("Enter a valid email address"), z.literal("")])
    .optional(),
});

export type SocialsFormValues = z.infer<typeof socialsSchema>;

export const siteSchema = z.object({
  siteName: z.string().min(2, "Site name must be at least 2 characters"),
  tagline: z.string().min(2, "Tagline must be at least 2 characters"),
});

export type SiteFormValues = z.infer<typeof siteSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

// Body untuk API admin (bukan untuk form client). Nama field = nama kolom
// `site_settings`, bukan nama field form client (`title`, `github`, ...), jadi
// route menyalin grup apa adanya tanpa peta rename. Grup mengikuti blok
// "// Profile" / "// Social" / "// Site" di prisma/schema.prisma.

/**
 * Kolom null berarti "belum di-override" -> `resolveSiteSettings` jatuh ke env.
 * String kosong harus ditolak di boundary ini: satu field kosong tidak boleh
 * sampai ke DB dan mengosongkan halaman publik.
 */
function required(label: string) {
  return z.string().trim().min(1, `${label} cannot be empty`);
}

/**
 * Kunci nav kanonik, disalin dari `DEFAULT_QUICK_LINK_KEYS` (@/lib/settings)
 * dan tidak diimpor sebagai nilai: modul ini ikut ter-bundle ke browser lewat
 * form admin, sementara `@/lib/settings` menarik `@/lib/prisma` ke client graph.
 * `satisfies` gagal build kalau ada key yang bukan key kanonik, dan
 * `form-schemas.test.ts` menjaga kedua arah sinkronisitasnya.
 */
const quickLinkKeys = [
  "home",
  "about",
  "projects",
  "experience",
  "certificates",
  "contact",
] as const satisfies readonly (typeof DEFAULT_QUICK_LINK_KEYS)[number][];

const profileUpdateSchema = z.object({
  fullName: required("Full name"),
  jobTitle: required("Title"),
  bio: required("Bio"),
  location: required("Location"),
  contactEmail: z.email("Enter a valid email address"),
});

const socialsUpdateSchema = z.object({
  githubUrl: z.url("Enter a valid URL"),
  linkedinUrl: z.url("Enter a valid URL"),
  twitterUrl: z.url("Enter a valid URL"),
});

const siteUpdateSchema = z.object({
  siteName: required("Site name"),
  tagline: required("Tagline"),
  siteUrl: z.url("Enter a valid URL"),
  siteDescription: required("Site description"),
});

export const settingsUpdateSchema = z.object({
  // `.partial()` per grup: satu form = satu PUT, field yang tidak ikut dikirim
  // tidak boleh ditulis ulang.
  profile: profileUpdateSchema.partial().optional(),
  socials: socialsUpdateSchema.partial().optional(),
  site: siteUpdateSchema.partial().optional(),
  // Urutan, bukan himpunan: admin boleh men-subset enam nav key kanonik.
  quickLinks: z
    .array(z.enum(quickLinkKeys))
    .min(1, "Quick links cannot be empty")
    .optional(),
});

export type SettingsUpdateValues = z.infer<typeof settingsUpdateSchema>;

/** Empat section yang bisa di-reset; `section` yang kosong berarti reset semua. */
export const SETTINGS_SECTIONS = ["profile", "socials", "site", "quickLinks"] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export const settingsResetSchema = z
  .object({ section: z.enum(SETTINGS_SECTIONS).optional() })
  .default({});

export type SettingsResetValues = z.infer<typeof settingsResetSchema>;
