import { useScroll, useTransform, type MotionValue } from "framer-motion";
import type { ExperienceListData } from "@/components/sections/experience-list/constants";

export interface UseExperienceDetailReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  headerY: MotionValue<number>;
  headerScale: MotionValue<number>;
  headerOpacity: MotionValue<number>;
}

export function getAdjacentExperiences(
  list: ExperienceListData[],
  slug: string,
): { prev: ExperienceListData | null; next: ExperienceListData | null } {
  const index = list.findIndex((e) => e.slug === slug);
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  };
}

export function useExperienceDetail(
  containerRef: React.RefObject<HTMLDivElement | null>,
): UseExperienceDetailReturn {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  return {
    containerRef,
    headerY: useTransform(scrollYProgress, [0, 1], [0, 200]),
    headerScale: useTransform(scrollYProgress, [0, 1], [1, 1.1]),
    headerOpacity: useTransform(scrollYProgress, [0, 0.5], [1, 0]),
  };
}