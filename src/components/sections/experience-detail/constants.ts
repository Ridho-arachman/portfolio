import type { ExperienceListData } from "@/components/sections/experience-list/constants";

export type { ExperienceListData };

export const EXPERIENCE_DETAIL = {
  backLabel: "Kembali ke Pengalaman",
  backHref: "/experience",
  achievementsTitle: "Pencapaian & Tanggung Jawab",
  galleryTitle: "Galeri",
  prevLabel: "Pengalaman Sebelumnya",
  nextLabel: "Pengalaman Selanjutnya",
} as const;

export type { ExperienceListData as ExperienceDetailData };