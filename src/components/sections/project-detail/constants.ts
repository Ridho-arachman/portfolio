import type { Project } from "@/components/sections/projects/constants";

export type { Project };

export const PROJECT_DETAIL = {
  backLabel: "Kembali ke Proyek",
  backHref: "/projects",
  overviewTitle: "Ringkasan",
  highlightsTitle: "Sorotan Proyek",
  stackTitle: "Teknologi",
  galleryTitle: "Galeri",
  prevLabel: "Proyek Sebelumnya",
  nextLabel: "Proyek Selanjutnya",
} as const;