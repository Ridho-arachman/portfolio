import { z } from "zod";
import { DEFAULT_LOCALE, type Locale } from "./i18n";
import {
  CATEGORY_TRANSLATABLE_FIELDS,
  CERTIFICATE_TRANSLATABLE_FIELDS,
  EXPERIENCE_TRANSLATABLE_FIELDS,
  PROJECT_TRANSLATABLE_FIELDS,
  categoryTranslationsSchema,
  certificateTranslationsSchema,
  experienceTranslationsSchema,
  projectTranslationsSchema,
} from "@/schema/content-translations";

/**
 * Resolver copy konten per-locale untuk Project / Experience / Certificate.
 *
 * Prinsip: fungsi ini tidak pernah melempar error dan tidak pernah mengosongkan
 * halaman. Kolom `translations` di DB tidak punya validasi tingkat database,
 * jadi isinya bisa rusak kapan saja (JSON bukan-objek, locale asing, field yang
 * sudah dihapus dari skema). Semua itu diabaikan dan kolom base yang menang —
 * persis seperti `getMessages()` di src/lib/translations.ts, yang juga selalu
 * jatuh ke dokumen bawaan.
 *
 * Kolom `translations` selalu DIBUANG dari hasil: halaman detail meneruskan row
 * utuh ke client component, jadi menyisakannya akan mengirim copy kedua bahasa
 * ke setiap pengunjung tanpa ada yang memakainya.
 *
 * Murni tanpa I/O, jadi target utama unit test.
 */

/** Override yang sah untuk satu locale: setiap field opsional, string tidak kosong. */
type Overrides = Record<string, unknown>;

/**
 * Nilai override hanya dipakai kalau ia benar-benar berisi copy. String kosong
 * atau array kosong berarti "admin belum mengisi" — perlakukan sama dengan
 * absen, supaya mengosongkan field di form admin mewarisi base lagi, bukan
 * membuat halaman kehilangan judul.
 */
function isPresent(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null;
}

function localizeWith<T extends { translations?: unknown }>(
  row: T,
  locale: Locale,
  schema: z.ZodType<Record<string, Overrides>>,
  fields: readonly string[],
): T {
  const { translations, ...base } = row;

  if (locale === DEFAULT_LOCALE || translations == null) return base as T;

  const container = schema.safeParse(translations);
  if (!container.success) return base as T;

  const overrides = container.data[locale];
  if (!overrides) return base as T;

  const merged: Record<string, unknown> = { ...base };

  for (const field of fields) {
    const value = overrides[field];
    if (isPresent(value)) merged[field] = value;
  }

  return merged as T;
}

export function localizeProject<T extends { translations?: unknown }>(
  row: T,
  locale: Locale,
): T {
  return localizeWith(row, locale, projectTranslationsSchema, PROJECT_TRANSLATABLE_FIELDS);
}

export function localizeExperience<T extends { translations?: unknown }>(
  row: T,
  locale: Locale,
): T {
  return localizeWith(
    row,
    locale,
    experienceTranslationsSchema,
    EXPERIENCE_TRANSLATABLE_FIELDS,
  );
}

export function localizeCertificate<T extends { translations?: unknown }>(
  row: T,
  locale: Locale,
): T {
  return localizeWith(
    row,
    locale,
    certificateTranslationsSchema,
    CERTIFICATE_TRANSLATABLE_FIELDS,
  );
}

export function localizeCategory<T extends { translations?: unknown }>(
  row: T,
  locale: Locale,
): T {
  return localizeWith(row, locale, categoryTranslationsSchema, CATEGORY_TRANSLATABLE_FIELDS);
}

/** Varian array untuk halaman daftar, supaya tidak perlu `.map()` di call site. */
export function localizeProjects<T extends { translations?: unknown }>(
  rows: readonly T[],
  locale: Locale,
): T[] {
  return rows.map((row) => localizeProject(row, locale));
}

export function localizeExperiences<T extends { translations?: unknown }>(
  rows: readonly T[],
  locale: Locale,
): T[] {
  return rows.map((row) => localizeExperience(row, locale));
}

export function localizeCertificates<T extends { translations?: unknown }>(
  rows: readonly T[],
  locale: Locale,
): T[] {
  return rows.map((row) => localizeCertificate(row, locale));
}

export function localizeCategories<T extends { translations?: unknown }>(
  rows: readonly T[],
  locale: Locale,
): T[] {
  return rows.map((row) => localizeCategory(row, locale));
}
