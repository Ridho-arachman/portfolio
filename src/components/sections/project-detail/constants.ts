import type { Project } from "@/components/sections/projects/constants";

export type { Project };

export const PROJECT_DETAIL = {
  backHref: "/projects",
  backLabelKey: "back",
  overviewTitleKey: "overview",
  highlightsTitleKey: "highlights",
  stackTitleKey: "tech",
  galleryTitleKey: "gallery",
  prevLabelKey: "prev",
  nextLabelKey: "next",
} as const;