import type { ExperienceListData } from "@/components/sections/experience-list/constants";

export type { ExperienceListData };

export const EXPERIENCE_DETAIL = {
  backHref: "/experience",
  backKey: "back",
  achievementsKey: "achievements",
  galleryKey: "gallery",
  prevKey: "prev",
  nextKey: "next",
} as const;

export type { ExperienceListData as ExperienceDetailData };