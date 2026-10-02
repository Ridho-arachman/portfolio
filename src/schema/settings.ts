import { z } from "zod";

import { DEFAULT_QUICK_LINK_KEYS } from "@/lib/quick-links";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  idJobTitle: z.string().optional(),
  idLocation: z.string().optional(),
  idBio: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const socialsSchema = z.object({
  github: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  linkedin: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  x: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  instagram: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  email: z
    .union([z.email("Enter a valid email address"), z.literal("")])
    .optional(),
});

export type SocialsFormValues = z.infer<typeof socialsSchema>;

export const siteSchema = z.object({
  siteName: z.string().min(2, "Site name must be at least 2 characters"),
  tagline: z.string().min(2, "Tagline must be at least 2 characters"),
  idTagline: z.string().optional(),
  idSiteDescription: z.string().optional(),
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
 * Teks wajib memakai required() (kosong ditolak); URL opsional memakai
 * emptyToNullUrl() (kosong berarti NULL = kembali ke env).
 */
function required(label: string) {
  return z.string().trim().min(1, `${label} cannot be empty`);
}

/**
 * URL opsional: string kosong berarti "kosongkan kolom" (NULL -> jatuh ke env),
 * bukan error. Form admin selalu mengirim semua field grup (termasuk yang tidak
 * diubah dan field baru yang default-nya kosong seperti Instagram); menolak ""
 * di sini membuat seluruh form Socials gagal disimpan dengan 400.
 * Field wajib (profile/site teks) tetap memakai required() di atas.
 */
function emptyToNullUrl(label: string) {
  return z
    .union([z.url(label), z.literal("")])
    .transform((value) => (value === "" ? null : value));
}

/**
 * Kunci nav kanonik diimpor sebagai nilai, bukan disalin: `@/lib/quick-links`
 * bebas dari Prisma dan react-icons, jadi aman ikut ter-bundle ke browser lewat
 * form admin. Jangan dikembalikan jadi salinan — `settings.test.ts` menjaga
 * kedua arah sinkronisitasnya.
 */
const quickLinkKeys = DEFAULT_QUICK_LINK_KEYS;


const profileUpdateSchema = z.object({
  fullName: required("Full name"),
  jobTitle: required("Title"),
  bio: required("Bio"),
  location: required("Location"),
  contactEmail: z.email("Enter a valid email address"),
});

const socialsUpdateSchema = z.object({
  githubUrl: emptyToNullUrl("Enter a valid URL"),
  linkedinUrl: emptyToNullUrl("Enter a valid URL"),
  twitterUrl: emptyToNullUrl("Enter a valid URL"),
  instagramUrl: emptyToNullUrl("Enter a valid URL"),
});

const siteUpdateSchema = z.object({
  siteName: required("Site name"),
  tagline: required("Tagline"),
  siteUrl: emptyToNullUrl("Enter a valid URL"),
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
  // Override copy Bahasa Indonesia, nested per locale: form profile mengirim
  // id { bio, jobTitle, location }, form site mengirim id { tagline,
  // siteDescription }. String kosong berarti "warisi base" dan dipertahankan
  // apa adanya — resolver yang mengabaikannya, bukan skema ini, supaya admin
  // bisa mengosongkan override yang dulu pernah diisi.
  translations: z
    .object({
      id: z
        .object({
          bio: z.string().optional(),
          jobTitle: z.string().optional(),
          location: z.string().optional(),
          tagline: z.string().optional(),
          siteDescription: z.string().optional(),
        })
        .optional(),
    })
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
