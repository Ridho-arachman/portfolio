import {
  Award,
  Briefcase,
  Code2,
  Database,
  FolderKanban,
  Globe,
  ShieldCheck,
} from "lucide-react";

/** Ikon TIDAK boleh dikirim dari Server Component ke Client Component,
 * jadi halaman hanya mengirim nama set ini sebagai string biasa. */
export const PAGE_HERO_ICONS = {
  projects: [FolderKanban, Code2, Globe],
  experience: [Briefcase, Code2, Database],
  certificates: [Award, ShieldCheck, Database],
} as const;

export type PageHeroIconSet = keyof typeof PAGE_HERO_ICONS;

export interface PageHeroProps {
  /** Teks badge pill di atas judul (uppercase via styling). */
  badge: string;
  /** Kata pertama judul (plain). */
  title: string;
  /** Kata kedua judul — bergradasi + glow, mengikuti bahasa visual About.
   * Opsional: jika kosong, span aksen (dan glow-nya) tidak dirender sama sekali. */
  titleAccent?: string;
  /** Kalimat subjudul di bawah judul. */
  description: string;
  /** Nama set ikon mengapung (dipetakan di sisi client). */
  iconSet?: PageHeroIconSet;
}
