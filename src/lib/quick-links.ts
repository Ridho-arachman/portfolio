// lib/quick-links.ts
// Satu-satunya sumber kebenaran untuk kunci + path nav cepat.
//
// Sengaja TANPA "use client" dan TANPA react-icons: modul ini diimpor oleh
// zod schema (ter-bundle ke browser), resolver settings (server-only, menarik
// Prisma), dan komponen client. Tanpa dua hal itu di sini, satu file bisa
// dipakai ketiganya tanpa menarik Prisma atau ikon ke client graph.
export const DEFAULT_QUICK_LINK_KEYS = [
  "home",
  "about",
  "projects",
  "experience",
  "certificates",
  "contact",
] as const;

export type QuickLinkKey = (typeof DEFAULT_QUICK_LINK_KEYS)[number];

/** Path relatif (tanpa locale) — `addLocaleToPath` yang menambah locale. */
export const QUICK_LINK_PATHS: Record<QuickLinkKey, string> = {
  home: "/",
  about: "/about",
  projects: "/projects",
  experience: "/experience",
  certificates: "/certificates",
  contact: "/contact",
};

/**
 * `quickLinks` datang dari DB sebagai `string[]`, jadi key baru bisa lolos ke
 * klien. Type guard ini yang membuat peta di atas jadi satu-satunya sumber
 * kebenaran: key yang tidak dikenal dilewati, bukan di-cari jadi `undefined`.
 */
export function isQuickLinkKey(key: string): key is QuickLinkKey {
  return Object.hasOwn(QUICK_LINK_PATHS, key);
}
