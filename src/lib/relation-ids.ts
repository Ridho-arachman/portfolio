// Trust boundary untuk id many-to-many (Project↔Certificate, Project↔Experience)
// dan untuk `Project.categoryId`.
//
// Kenapa harus dicek sebelum menulis: id di body request datang dari client.
// Relasi m-n Prisma memakai tabel join implisit, jadi `connect` dengan id yang
// tidak ada akan menyimpan baris join yang menunjuk entitas fiktif — bukan
// error yang berguna. `Project.categoryId` lebih ketat (NOT NULL + Restrict) dan akan
// jadi P2003. Dua-duanya lebih murah dicek di sini: satu query `id IN (...)`
// per model, jawaban 400 yang menyebut id mana yang tidak dikenal, bukan
// error Prisma mentah.
//
// Soft delete: baris di trash MASIH ada dan masih FK target yang sah, jadi
// pengecekan ini sengaja tidak memfilter `deletedAt`. Kalau difilter, menyimpan
// ulang sebuah project yang masih tertaut ke certificate di trash akan 400.
// Yang mencegah admin memilih baris trash adalah daftar opsi di form, bukan
// helper ini.

import prisma from "@/lib/prisma";

/** Model yang bisa muncul sebagai daftar id di payload admin. */
export type RelationModel =
  | "project"
  | "certificate"
  | "experience"
  | "category";

// Satu closure per model, bukan `prisma[model]`: dipanggil langsung, jadi tipe
// argument dan hasil select-nya dikoreksi compiler per model.
const findIds = {
  project: (ids: string[]) =>
    prisma.project.findMany({ where: { id: { in: ids } }, select: { id: true } }),
  certificate: (ids: string[]) =>
    prisma.certificate.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    }),
  experience: (ids: string[]) =>
    prisma.experience.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    }),
  category: (ids: string[]) =>
    prisma.category.findMany({ where: { id: { in: ids } }, select: { id: true } }),
} as const;

export interface RelationIdGroup {
  /** Kata benda untuk pesan error, e.g. "certificate". */
  label: string;
  model: RelationModel;
  /** `undefined` / kosong = tidak ada yang perlu diperiksa. */
  ids: readonly string[] | undefined;
}

/**
 * Pesan 400 pertama yang menyebut id mana yang tidak dikenal, atau `null` kalau
 * semua id resolve. Memeriksa group secara berurutan supaya pesan yang muncul
 * paling spesifik terhadap group pertama yang bermasalah.
 *
 * @param groups Semua daftar id pada satu payload, sekaligus. Satu pemanggilan
 *   per route supaya tidak ada jalur tulis yang lupa memvalidasi.
 */
export async function findUnknownRelationMessage(
  groups: readonly RelationIdGroup[],
): Promise<string | null> {
  for (const group of groups) {
    if (!group.ids || group.ids.length === 0) continue;

    const rows = await findIds[group.model]([...group.ids]);
    const found = new Set(rows.map((row) => row.id));
    const missing = group.ids.filter((id) => !found.has(id));

    if (missing.length > 0) {
      return `Unknown ${group.label} ids: ${missing.join(", ")}`;
    }
  }

  return null;
}