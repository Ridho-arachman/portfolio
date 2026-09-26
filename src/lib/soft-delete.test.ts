// Unit test konstanta soft delete. Kedua constant ini akan di-spread ke setiap
// `where` Prisma, jadi bentuknya harus persis.
import { describe, expect, it } from "vitest";

import { notDeleted, trashedOnly } from "./soft-delete";

describe("soft-delete filter fragments", () => {
  it("notDeleted menyaring baris yang belum dihapus", () => {
    expect(notDeleted).toEqual({ deletedAt: null });
  });

  it("trashedOnly menyaring baris yang sudah dihapus", () => {
    expect(trashedOnly).toEqual({ deletedAt: { not: null } });
  });

  it("keduanya tidak saling tumpang tindih", () => {
    expect(notDeleted.deletedAt).toBeNull();
    expect(trashedOnly.deletedAt).not.toBeNull();
  });

  // Fragment kedua selalu menimpa yang pertama, jadi setiap route menulis
  // `...(trashed ? trashedOnly : notDeleted)`. Salah pilih berarti baris trash
  // bocor ke daftar publik, jadi komposisi ini harus terkunci.
  it("komposisi last-write-wins memilih tepat satu filter", () => {
    const build = (trashed: boolean) => ({
      ...(trashed ? trashedOnly : notDeleted),
    });

    expect(build(true)).toEqual({ deletedAt: { not: null } });
    expect(build(false)).toEqual({ deletedAt: null });
  });

  // Fragment ini adalah filter, bukan data. Kalau `deletedAt` pernah ikut
  // ter-select ke payload yang dibungkus `unstable_cache`, kolom Date akan
  // kembali jadi string setelah cache warm dan perbandingannya rusak.
  it("tidak menyimpan nilai Date, hanya operator", () => {
    expect(notDeleted.deletedAt).toBeNull();
    expect(trashedOnly.deletedAt).toEqual({ not: null });
  });
});
