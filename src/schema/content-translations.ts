import { z } from "zod";
import { LOCALES } from "@/lib/i18n";

/**
 * Kontrak kolom `translations` untuk Project / Experience / Certificate.
 *
 * Kolom basis (title, description, ...) pada model adalah konten
 * DEFAULT_LOCALE ("en"). Kolom ini hanya memuat override per locale, jadi
 * menambah locale baru cukup menambah entri di `LOCALES` — bukan di sini.
 *
 * Field yang boleh dioverride sengaja sempit: hanya copy/prose. Proper noun
 * (company, issuer) dan istilah teknis (technologies, skills, location) tidak
 * pernah diterjemahkan, jadi tidak ada gunanya menyediakan field-nya.
 *
 * Dipakai di dua sisi, dan itu disengaja:
 *   - tulis: divalidasi di trust boundary admin API
 *   - baca:  `localize()` di src/lib/localized-content.ts mem-parse ulang kolom
 *             yang sama, supaya JSON rusak di DB jatuh ke base, bukan 500
 *
 * Skema ini murni cek *shape* (kunci mana yang sah, tipe apa), tidak menyaring
 * string kosong. "Override kosong berarti mewarisi base" punya satu pemilik
 * saja, yaitu `isPresent()` di resolver — kalau ditolak di sini, admin tidak
 * bisa pernah mengosongkan override yang dulu pernah diisi.
 */
function localizedContent<T extends z.ZodRawShape>(inner: T) {
  const value = z.strictObject(inner).partial();

  return {
    /** Bentuk penuh kolom DB: { "id": { "title": "..." } }. */
    schema: z.partialRecord(z.enum(LOCALES), value),
    /**
     * Kunci yang di-copy resolver. Diturunkan dari shape, bukan ditulis ulang,
     * supaya mustahil drift dari skema.
     */
    fields: Object.keys(inner) as Array<Extract<keyof T, string>>,
  };
}

const project = localizedContent({
  title: z.string(),
  description: z.string(),
  role: z.string(),
  highlights: z.array(z.string()),
});

const experience = localizedContent({
  title: z.string(),
  description: z.array(z.string()),
});

const certificate = localizedContent({
  title: z.string(),
  summary: z.array(z.string()),
});

const category = localizedContent({
  name: z.string(),
  description: z.string(),
});

export const projectTranslationsSchema = project.schema;
export const experienceTranslationsSchema = experience.schema;
export const certificateTranslationsSchema = certificate.schema;
export const categoryTranslationsSchema = category.schema;

export const PROJECT_TRANSLATABLE_FIELDS = project.fields;
export const EXPERIENCE_TRANSLATABLE_FIELDS = experience.fields;
export const CERTIFICATE_TRANSLATABLE_FIELDS = certificate.fields;
export const CATEGORY_TRANSLATABLE_FIELDS = category.fields;

export type ProjectTranslations = z.infer<typeof project.schema>;
export type ExperienceTranslations = z.infer<typeof experience.schema>;
export type CertificateTranslations = z.infer<typeof certificate.schema>;
export type CategoryTranslations = z.infer<typeof category.schema>;

export function idOverrides<T extends Record<string, string | string[]>>(fields: T) {
  const id: Partial<T> = {};

  for (const [key, value] of Object.entries(fields)) {
    const filled = Array.isArray(value)
      ? value.length > 0
      : value.trim().length > 0;
    if (filled) id[key as keyof T] = value as T[keyof T];
  }

  return { id };
}
