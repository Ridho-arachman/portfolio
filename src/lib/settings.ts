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
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
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
  instagramUrl: true,
  siteName: true,
  tagline: true,
  siteUrl: true,
  siteDescription: true,
  quickLinks: true,
  translations: true,
} as const;

/** Bentuk baris `site_settings` apa adanya: setiap kolom boleh null.
 *  `translations` adalah JSON mentah (JsonValue | null) — jangan dibaca langsung,
 *  pakai `resolveSiteSettings` (hasil resolved) atau `rawIdOverrides` (prefill form).
 */
export type SiteSettingsRow = Pick<SiteSettingsModel, keyof typeof SITE_SETTINGS_SELECT>;

/**
 * Kolom base di atas adalah konten DEFAULT_LOCALE (en); hanya copy/prose yang
 * boleh dioverride. fullName/siteName/contactEmail/URL tidak ada di sini: itu
 * proper noun/identifier, bukan copy. Category punya kolom sendiri di batch lain.
 */
export const SITE_SETTINGS_TRANSLATABLE_FIELDS = [
  "bio",
  "jobTitle",
  "location",
  "tagline",
  "siteDescription",
] as const;

export type SiteSettingsTranslatableField =
  (typeof SITE_SETTINGS_TRANSLATABLE_FIELDS)[number];

/** Override sah untuk satu locale: setiap field opsional, string tidak kosong. */
export type SiteSettingsIdOverrides = Partial<
  Record<SiteSettingsTranslatableField, string>
>;

/** Bentuk kolom `translations`: `{ "id": { ... } }`. Locale lain tidak ada. */
export type SiteSettingsTranslations = {
  id?: SiteSettingsIdOverrides;
};

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
  instagramUrl: string;
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
    instagramUrl: env.NEXT_PUBLIC_INSTAGRAM_URL,
    siteName: env.NEXT_PUBLIC_SITE_NAME,
    tagline: env.NEXT_PUBLIC_SITE_TAGLINE,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    siteDescription: env.NEXT_PUBLIC_SITE_DESCRIPTION,
    quickLinks: [...DEFAULT_QUICK_LINK_KEYS],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/**
 * Override non-empty untuk satu locale. Kolom `translations` tidak punya
 * validasi tingkat database, jadi isinya bisa rusak kapan saja — semua itu
 * diabaikan dan base yang menang, persis seperti `localize()` konten.
 */
function presentIdOverrides(
  translations: unknown,
  locale: Locale,
): SiteSettingsIdOverrides | null {
  if (!isRecord(translations)) return null;
  const group = translations[locale];
  if (!isRecord(group)) return null;
  const out: SiteSettingsIdOverrides = {};
  for (const field of SITE_SETTINGS_TRANSLATABLE_FIELDS) {
    const value = group[field];
    if (typeof value === "string" && value.trim()) out[field] = value;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * Override mentah untuk satu locale, termasuk string kosong — prefill form
 * admin harus menampilkan persis apa yang tersimpan, bukan hasil resolve.
 */
export function rawIdOverrides(translations: unknown, locale: Locale): SiteSettingsIdOverrides {
  if (!isRecord(translations)) return {};
  const group = translations[locale];
  if (!isRecord(group)) return {};
  const out: SiteSettingsIdOverrides = {};
  for (const field of SITE_SETTINGS_TRANSLATABLE_FIELDS) {
    const value = group[field];
    if (typeof value === "string") out[field] = value;
  }
  return out;
}

/**
 * Murni (tanpa I/O): gabungkan baris DB dengan default env per field.
 * `locale` memilih copy: "en" memakai kolom base apa adanya; locale lain
 * menimpa lima field translatable dengan `translations[locale]` yang non-empty.
 * Override absen/kosong/rusak berarti "warisi base" — tidak pernah 500.
 * Target utama unit test — jangan panggil `getSiteSettings()` dari sini.
 */
export function resolveSiteSettings(
  row: SiteSettingsRow | null,
  locale: Locale = DEFAULT_LOCALE,
): SiteSettings {
  const env = envSiteSettings();

  const base: SiteSettings = {
    fullName: pick(row?.fullName, env.fullName),
    jobTitle: pick(row?.jobTitle, env.jobTitle),
    bio: pick(row?.bio, env.bio),
    location: pick(row?.location, env.location),
    contactEmail: pick(row?.contactEmail, env.contactEmail),
    githubUrl: pick(row?.githubUrl, env.githubUrl),
    linkedinUrl: pick(row?.linkedinUrl, env.linkedinUrl),
    twitterUrl: pick(row?.twitterUrl, env.twitterUrl),
    instagramUrl: pick(row?.instagramUrl, env.instagramUrl),
    siteName: pick(row?.siteName, env.siteName),
    tagline: pick(row?.tagline, env.tagline),
    siteUrl: pick(row?.siteUrl, env.siteUrl),
    siteDescription: pick(row?.siteDescription, env.siteDescription),
    quickLinks: row?.quickLinks.length ? [...row.quickLinks] : env.quickLinks,
  };

  if (locale === DEFAULT_LOCALE) return base;

  const overrides = presentIdOverrides(row?.translations, locale);
  if (!overrides) return base;

  return {
    ...base,
    bio: pick(overrides.bio, base.bio),
    jobTitle: pick(overrides.jobTitle, base.jobTitle),
    location: pick(overrides.location, base.location),
    tagline: pick(overrides.tagline, base.tagline),
    siteDescription: pick(overrides.siteDescription, base.siteDescription),
  };
}

/**
 * Sumber tunggal untuk halaman publik. `locale` ikut jadi bagian cache key
 * (argumen `unstable_cache` diserialise ke key), jadi entri "en" dan "id"
 * tidak pernah tertukar. Key v2: entri v1 single-locale tidak boleh dipakai ulang.
 *
 * Baca dengan `findUnique`, bukan `upsert`. `upsert` di jalur baca bersaing antar
 * request saat cache masih dingin: dua request sekaligus sama-sama mencoba
 * `create`, dan yang kalah kena P2002 di `site_settings_pkey` — fallback env
 * lalu menutupi setting admin sampai cache hangat. Baris singleton-nya sendiri
 * dibuat oleh `PUT /api/admin/settings`, jadi pembacaan tidak perlu membuat.
 * Kalau database mati, kembalikan default env — situs tetap utuh, tidak 500.
 */
export const getSiteSettings = unstable_cache(
  async (locale: Locale = DEFAULT_LOCALE): Promise<SiteSettings> => {
    try {
      const row = await prisma.siteSettings.findUnique({
        where: { id: SITE_SETTINGS_ID },
        select: SITE_SETTINGS_SELECT,
      });

      return resolveSiteSettings(row, locale);
    } catch (error) {
      console.error("[settings] gagal memuat site_settings, pakai default env:", error);
      return envSiteSettings();
    }
  },
  ["site-settings-v2"],
  { revalidate: 3600, tags: ["site-settings"] },
);

/** Bentuk yang dibaca form admin: base resolved (en) + override id mentah. */
export type AdminSettingsPayload = SiteSettings & {
  translations: SiteSettingsTranslations | null;
};

/**
 * Sumber tunggal untuk halaman admin: form butuh nilai efektif (prefill EN)
 * sekaligus override mentah (prefill input ID). Selalu resolve base "en" —
 * admin mengedit base dan override, bukan hasil resolve per locale.
 */
export async function getAdminSettings(): Promise<AdminSettingsPayload> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: SITE_SETTINGS_ID },
      select: SITE_SETTINGS_SELECT,
    });

    const id = rawIdOverrides(row?.translations, "id");
    return {
      ...resolveSiteSettings(row, DEFAULT_LOCALE),
      translations: Object.keys(id).length > 0 ? { id } : null,
    };
  } catch (error) {
    console.error("[settings] gagal memuat site_settings, pakai default env:", error);
    return { ...envSiteSettings(), translations: null };
  }
}

/**
 * Gabung grup `translations` masuk dengan yang tersimpan: key yang tidak
 * dikirim tidak tersentuh (satu form = satu PUT), string kosong dipertahankan
 * supaya resolver mewarisi base. Kosong total berarti NULL, bukan `{}`.
 */
export function mergeSettingsTranslations(
  existing: unknown,
  incoming: SiteSettingsTranslations | undefined,
): SiteSettingsTranslations | null {
  const next: SiteSettingsTranslations = {};
  const stored = isRecord(existing) ? existing.id : undefined;
  const patch = incoming?.id;
  const merged: Record<string, string> = {};
  for (const source of [stored, patch]) {
    if (!isRecord(source)) continue;
    for (const field of SITE_SETTINGS_TRANSLATABLE_FIELDS) {
      const value = source[field];
      if (typeof value === "string") merged[field] = value;
    }
  }
  if (Object.keys(merged).length === 0) return null;
  next.id = merged;
  return next;
}

/**
 * Buang field translations milik satu section saat reset: profile membuang
 * bio/jobTitle/location, site membuang tagline/siteDescription. Kosong total
 * berarti NULL supaya baris kembali persis seperti sebelum ada override.
 */
export function clearSettingsTranslationFields(
  existing: unknown,
  fields: readonly SiteSettingsTranslatableField[],
): SiteSettingsTranslations | null {
  const drop = new Set<string>(fields);
  const kept: Record<string, string> = {};
  const stored = isRecord(existing) ? existing.id : undefined;
  if (isRecord(stored)) {
    for (const field of SITE_SETTINGS_TRANSLATABLE_FIELDS) {
      const value = stored[field];
      if (typeof value === "string" && !drop.has(field)) kept[field] = value;
    }
  }
  if (Object.keys(kept).length === 0) return null;
  return { id: kept };
}
