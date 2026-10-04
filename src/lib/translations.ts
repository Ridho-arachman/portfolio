// lib/translations.ts
// Resolver tunggal untuk copy multibahasa dengan fallback dua tingkat:
//   1. override admin di tabel `translation` (patch datar "hero.greeting" -> "Halo")
//   2. dokumen bawaan src/messages/<locale>.json
//
// Prinsip: fungsi ini tidak pernah melempar error dan tidak pernah mengosongkan
// situs. Patch yang tidak bisa dipakai sama sekali (DB mati, JSON rusak, semua
// kunci asing) jatuh ke dokumen bawaan; satu kunci rusak hanya membuang kunci
// itu (resolveMessagesLenient), supaya halaman publik selalu punya copy lengkap.
import { unstable_cache } from "next/cache";
import { z } from "zod/v4";

import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";
import prisma from "@/lib/prisma";
import { Locale, DEFAULT_LOCALE } from "./i18n";
import { Messages } from "./translation-types";

const bundled: Record<Locale, Messages> = {
  en: enMessages,
  id: idMessages,
};

// Segmen kunci boleh underscore: en.json memuat skills.categories.DEVOPS_TOOLS
// dan skills.categories.SOFT_SKILL, jadi keduanya harus tetap bisa diedit admin.
const DOTTED_KEY = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/;

export const translationPatchSchema = z.object({
  values: z.record(
    z.string().regex(DOTTED_KEY, "Use a dotted key like hero.greeting"),
    z.string().min(1, "Translation value cannot be empty"),
  ),
});

export type TranslationPatchValues = z.infer<typeof translationPatchSchema>;

/**
 * Body PUT /api/admin/translations. `expectedUpdatedAt` opsional untuk
 * optimistic concurrency: ISO timestamp dari data yang dibaca klien.
 * Absen atau tidak valid → last-write-wins; basi → 409 di route.
 */
export const translationPutSchema = translationPatchSchema.extend({
  expectedUpdatedAt: z.string().optional(),
});

export type TranslationPutBody = z.infer<typeof translationPutSchema>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Turunkan shape zod dari satu dokumen JSON, supaya 267 leaf di en.json tidak
 * perlu ditulis ulang sebagai skema. Tiap object dibuat `strict` supaya kunci
 * asing DITOLAK, dan `partial` supaya patch boleh menimpa sebagian saja.
 * Leaf non-string (hero.typewriter) jadi `z.never()`: copy yang bisa ditimpa
 * admin hanya string.
 */
function shapeFromJson(node: Record<string, unknown>): z.ZodRawShape {
  const shape: Record<string, z.ZodType> = {};

  for (const [key, value] of Object.entries(node)) {
    if (isPlainObject(value)) {
      shape[key] = z.strictObject(shapeFromJson(value)).partial();
    } else if (typeof value === "string") {
      shape[key] = z.string();
    } else {
      shape[key] = z.never();
    }
  }

  return shape;
}

const patchDocumentSchema = z.strictObject(shapeFromJson(enMessages)).partial();

/**
 * `"hero.greeting"` -> `{ hero: { greeting } }`.
 * Akumulator null-prototype: tanpa itu kunci `__proto__` dari patch akan menulis
 * ke Object.prototype saat kita menelusuri segmen ("membaca" `__proto__` selalu
 * mengembalikan prototype, bukan undefined). Bentuk akhirnya sudah disanitasi
 * zod, tapi penolakannya datang setelah ekspansi.
 */
function expandDottedPaths(patch: Record<string, string>): Record<string, unknown> {
  const root: Record<string, unknown> = Object.create(null);

  for (const [path, value] of Object.entries(patch)) {
    const segments = path.split(".");
    let node = root;

    for (const segment of segments.slice(0, -1)) {
      if (!isPlainObject(node[segment])) {
        node[segment] = Object.create(null);
      }
      node = node[segment] as Record<string, unknown>;
    }

    node[segments[segments.length - 1]] = value;
  }

  return root;
}

/** Merge rekursif: namespace (`hero`) tidak boleh tergantikan utuh oleh patch-nya. */
function deepMerge(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    const existing = merged[key];
    merged[key] =
      isPlainObject(existing) && isPlainObject(value) ? deepMerge(existing, value) : value;
  }

  return merged;
}

/**
 * Murni (tanpa I/O): gabungkan patch datar di atas dokumen bawaan.
 * Target utama unit test — jangan panggil `getMessages()` dari sini.
 * Melempar ZodError kalau patch menyebut kunci yang tidak ada di en.json.
 */
export function resolveMessages(
  bundledDoc: Messages,
  patch: Record<string, string> | null,
): Messages {
  if (!patch || Object.keys(patch).length === 0) return bundledDoc;

  const validated = patchDocumentSchema.parse(expandDottedPaths(patch));

  // Sound: patch divalidasi strict terhadap shape turunan en.json, dokumen asal tipe `Messages`, jadi kunci asing ditolak dan tiap leaf hasil merge pasti string.
  return deepMerge(bundledDoc, validated) as Messages;
}

/**
 * Varian baca yang toleran terhadap satu kunci rusak: kalau patch lolos
 * `resolveMessages` apa adanya, kembalikan itu; kalau ZodError, coba tiap
 * kunci satu per satu, gabungkan yang valid di atas dokumen bawaan, dan
 * catat kunci yang dibuang ke console.error. Tidak pernah melempar ZodError;
 * error non-zod (tidak terduga dari fungsi murni ini) jatuh ke bawaan.
 * Jalur tulis (PUT) tetap memakai `resolveMessages` yang strict.
 */
export function resolveMessagesLenient(
  bundledDoc: Messages,
  patch: Record<string, string> | null,
): Messages {
  if (!patch || Object.keys(patch).length === 0) return bundledDoc;

  try {
    return resolveMessages(bundledDoc, patch);
  } catch (error) {
    if (!(error instanceof z.ZodError)) {
      console.error("[translations] gagal memuat translation, pakai dokumen bawaan:", error);
      return bundledDoc;
    }

    const valid: Record<string, string> = {};
    const dropped: string[] = [];

    for (const [key, value] of Object.entries(patch)) {
      try {
        resolveMessages(bundledDoc, { [key]: value });
        valid[key] = value;
      } catch {
        dropped.push(key);
      }
    }

    if (dropped.length > 0) {
      console.error("[translations] mengabaikan kunci tidak valid:", dropped);
    }
    if (Object.keys(valid).length === 0) return bundledDoc;

    return resolveMessages(bundledDoc, valid);
  }
}

/**
 * Sumber tunggal untuk halaman publik. Kalau database mati, atau patch-nya
 * tidak bisa dipakai, kembalikan dokumen bawaan — situs tetap utuh, tidak 500.
 */
export const getMessages = unstable_cache(
  async (locale: Locale): Promise<Messages> => {
    const bundledDoc = bundled[locale] ?? bundled[DEFAULT_LOCALE];

    try {
      const row = await prisma.translation.findUnique({
        where: { locale },
        select: { values: true },
      });

      // `values` bertipe Json longgar; parse ulang dengan schema yang sama seperti
      // body API admin supaya aturan "patch = datar, nilai = string" hanya didefinisikan sekali.
      const values = translationPatchSchema.shape.values.safeParse(row?.values);

      return resolveMessagesLenient(bundledDoc, values.success ? values.data : null);
    } catch (error) {
      console.error("[translations] gagal memuat translation, pakai dokumen bawaan:", error);
      return bundledDoc;
    }
  },
// v5: projectDetail/certificateDetail/experienceDetail dapat kunci heading
  // relasi baru (relatedCertificates / relatedExperiences / relatedProjects).
  // v4: experienceDetail.metaDescription, projectDetail.galleryImage, dan
  // faq.sourceLabel ditambahkan (literal EN hardcode pindah ke messages) —
  // dokumen lama ("messages-v3") di Data Cache Vercel (persisten antar-deploy)
  // tidak punya kunci baru itu sehingga t.*.undefined. Naikkan versi setiap
  // kali shape top-level messages berubah.
  ["messages-v5"],
  { revalidate: 3600, tags: ["translations"] },
);
