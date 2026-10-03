/**
 * WCAG 2.2 "Target Size (Minimum)" (2.5.8) dan audit Lighthouse
 * `target-size` sama-sama menuntut target minimal 44x44 CSS px.
 *
 * Kontrol site ini punya kotak visual yang lebih pendek dari itu — tautan teks
 * setinggi ~20px, pil social setinggi 38px. Dua cara menutupnya, dipilih per
 * elemen supaya tidak ada yang bergeser:
 *
 * 1. `INLINE_LINK_PADDING` — untuk tautan inline di dalam paragraf. Padding
 *    vertikal pada kotak inline menambah area hit tetapi TIDAK menambah tinggi
 *    line box, jadi ritme baris dan posisi teks tetap persis sama.
 *
 * 2. `TAP_TARGET_HIT_AREA` — untuk elemen yang box-nya digambar (pil social
 *    punya border + background; baris quick link berbagi `space-y-3`). Padding
 *    akan mengubah yang terlihat atau menambah tinggi blok, jadi yang
 *    diperbesar hanya area hit-nya: pita transparan 44px yang berpusat di
 *    element asli lewat `::before`. Pita ini `position: absolute` sehingga
 *    tidak pernah ikut dihitung layout.
 *
 * Catatan: audit `target-size` (axe-core) membaca `getBoundingClientRect()`
 * dan tidak melihat pseudo-element, jadi pita `::before` memperbaiki	tap
 * target bagi pengguna tanpa mengubah angka audit. Kalau sebuah audit harus
 * lewat,element itu harus memakai padding — bukan pita.
 */
export const MIN_TAP_TARGET = 44;

/**
 * Class ditulis literal, bukan dirangkai dari template string: Tailwind v4
 * mengekstrak class dengan memindai source sebagai teks, jadi
 * `h-[${MIN_TAP_TARGET}px]` tidak akan pernah menghasilkan CSS. Test menjaga
 * `h-[44px]` tetap sinkron dengan `MIN_TAP_TARGET`.
 */
export const TAP_TARGET_HIT_AREA =
  "relative before:absolute before:inset-x-0 before:top-1/2 before:h-[44px] before:-translate-y-1/2 before:content-['']";

/**
 * 13px + 13px menutupi kedua tinggi teks yang dipakai di site ini: link lis
 * `text-sm` (19px) dan alamat email default (21px). Tanpa padding, tap target
 * hanya 19-21px; dengan, keduanya >= 44px dan line box tetap 20px.
 */
export const INLINE_LINK_PADDING = "py-[13px]";