// lib/settings.ts
// Resolver tunggal untuk settings situs dengan fallback tiga tingkat:
//   1. override admin di tabel `site_settings` (kalau kolomnya diisi)
//   2. env NEXT_PUBLIC_* sebagai default
//   3. nilai kosong dianggap "belum di-override", jadi selalu jatuh ke env
//
// Prinsip: fungsi ini tidak pernah melempar error dan tidak pernah mengosongkan
// situs. String kosong dari form admin tidak boleh wiping halaman publik.
import { unstable_cache } from "next/cache";

import type { SiteSettings as SiteSettingsModel } from "@/generated/prisma/client";
import { getClientEnv } from "@/lib/env";
import { DEFAULT_QUICK_LINK_KEYS } from "@/lib/quick-links";
import prisma from "@/lib/prisma";

/** Id baris singleton; kolom `id` di Prisma sudah di-default ke string ini. */
export const SITE_SETTINGS_ID = "singleton";

// Re-export, bukan definisi: schema/server/test mengimpor dari modul ini.
export { DEFAULT_QUICK_LINK_KEYS };

/**
 * Hanya kolom nilai yang dipilih — SENGAJA tanpa `createdAt`/`updatedAt`.
 * Hasil fungsi ini masuk ke `unstable_cache`, yang JSON-serialise payload:
 * `Date` akan balik jadi string saat cache hangat (insiden 86d09b0).
 * Tidak memilih kolom Date membuat kelas bug itu mustahil terjadi.
 */
export const SITE_SETTINGS_SELECT = {
  fullName: true,
  jobTitle: true,
  bio: true,
  location: true,
  contactEmail: true,
  githubUrl: true,
  linkedinUrl: true,
  twitterUrl: true,
  siteName: true,
  tagline: true,
  siteUrl: true,
  siteDescription: true,
  quickLinks: true,
} as const;

/** Bentuk baris `site_settings` apa adanya: setiap kolom boleh null. */
export type SiteSettingsRow = Pick<SiteSettingsModel, keyof typeof SITE_SETTINGS_SELECT>;

/** Bentuk final yang dikonsumsi UI: tidak ada null, tidak ada Date. */
export type SiteSettings = {
  fullName: string;
  jobTitle: string;
  bio: string;
  location: string;
  contactEmail: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  siteName: string;
  tagline: string;
  siteUrl: string;
  siteDescription: string;
  quickLinks: string[];
};

/**
 * Kolom null berarti "belum di-override" -> pakai env.
 * `??` saja membiarkan string kosong menang dan mengosongkan situs,
 * jadi string kosong/whitespace juga diperlakukan sebagai belum diisi.
 */
function pick(rowValue: string | null | undefined, fallback: string): string {
  return rowValue?.trim() ? rowValue : fallback;
}

/** Default tier-2: seluruh konfigurasi publik berasal dari env. */
export function envSiteSettings(): SiteSettings {
  const env = getClientEnv();

  return {
    fullName: env.NEXT_PUBLIC_AUTHOR_NAME,
    jobTitle: env.NEXT_PUBLIC_AUTHOR_TITLE,
    bio: env.NEXT_PUBLIC_AUTHOR_BIO,
    location: env.NEXT_PUBLIC_LOCATION,
    contactEmail: env.NEXT_PUBLIC_CONTACT_EMAIL,
    githubUrl: env.NEXT_PUBLIC_GITHUB_URL,
    linkedinUrl: env.NEXT_PUBLIC_LINKEDIN_URL,
    twitterUrl: env.NEXT_PUBLIC_TWITTER_URL,
    siteName: env.NEXT_PUBLIC_SITE_NAME,
    tagline: env.NEXT_PUBLIC_SITE_TAGLINE,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    siteDescription: env.NEXT_PUBLIC_SITE_DESCRIPTION,
    quickLinks: [...DEFAULT_QUICK_LINK_KEYS],
  };
}

/**
 * Murni (tanpa I/O): gabungkan baris DB dengan default env per field.
 * Target utama unit test — jangan panggil `getSiteSettings()` dari sini.
 */
export function resolveSiteSettings(row: SiteSettingsRow | null): SiteSettings {
  const env = envSiteSettings();

  return {
    fullName: pick(row?.fullName, env.fullName),
    jobTitle: pick(row?.jobTitle, env.jobTitle),
    bio: pick(row?.bio, env.bio),
    location: pick(row?.location, env.location),
    contactEmail: pick(row?.contactEmail, env.contactEmail),
    githubUrl: pick(row?.githubUrl, env.githubUrl),
    linkedinUrl: pick(row?.linkedinUrl, env.linkedinUrl),
    twitterUrl: pick(row?.twitterUrl, env.twitterUrl),
    siteName: pick(row?.siteName, env.siteName),
    tagline: pick(row?.tagline, env.tagline),
    siteUrl: pick(row?.siteUrl, env.siteUrl),
    siteDescription: pick(row?.siteDescription, env.siteDescription),
    quickLinks: row?.quickLinks.length ? [...row.quickLinks] : env.quickLinks,
  };
}

/**
 * Sumber tunggal untuk halaman publik. `upsert` membuat baris singleton saat
 * pertama dipanggil, jadi tidak perlu migrasi atau seed. Kalau database mati,
 * kembalikan default env — situs tetap utuh, tidak 500.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const row = await prisma.siteSettings.upsert({
        where: { id: SITE_SETTINGS_ID },
        create: {},
        update: {},
        select: SITE_SETTINGS_SELECT,
      });

      return resolveSiteSettings(row);
    } catch (error) {
      console.error("[settings] gagal memuat site_settings, pakai default env:", error);
      return envSiteSettings();
    }
  },
  ["site-settings-v1"],
  { revalidate: 3600, tags: ["site-settings"] },
);
