// lib/soft-delete.ts
// Dua konstanta untuk soft delete. Setiap pembacaan wajib menyertakan
// `notDeleted`; operasi hapus mengisi `deletedAt` alih-alih menghapus baris.
//
// Kenapa bukan extension Prisma: `@prisma/extension-soft-delete` tidak ada di
// npm, dan kandidat pihak ketiga yang ada dibangun di atas Prisma 5 atau belum
// punya dependent sama sekali. Extension juga mengubah `delete` dan `deleteMany`
// menjadi update, yang akan membuat seluruh teardown integration test dan seed
// script ikut menjadi soft delete lalu bocor antar run. Dengan filter eksplisit,
// `deleteMany` tetap hard delete sehingga tidak ada file test atau seed yang
// perlu diubah.
//
// Const ini hanya untuk filter query, tidak pernah untuk payload cache. Jangan
// pernah memilih `deletedAt` ke dalam hasil yang dibungkus `unstable_cache`:
// kolom Date kembali jadi string setelah cache warms up (insiden 86d09b0).
//
// Baris yang soft-deleted tetap menempati slug-nya, jadi slug yang sudah dipakai
// tidak bisa dipakai lagi sampai baris di-restore atau di-purge.
export const notDeleted = { deletedAt: null } as const;

export const trashedOnly = { deletedAt: { not: null } } as const;
