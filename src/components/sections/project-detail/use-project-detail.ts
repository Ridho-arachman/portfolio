import { useScroll, useTransform, type MotionValue } from "framer-motion";
import type { Project } from "@/components/sections/projects/constants";

export interface UseProjectDetailReturn {
  headerY: MotionValue<number>;
  headerScale: MotionValue<number>;
  headerOpacity: MotionValue<number>;
}

export function getAdjacentProjects(
  list: Project[],
  slug: string,
): { prev: Project | null; next: Project | null } {
  const index = list.findIndex((p) => p.slug === slug);
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  };
}

export function useProjectDetail(
  containerRef: React.RefObject<HTMLDivElement | null>,
): UseProjectDetailReturn {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  return {
    headerY: useTransform(scrollYProgress, [0, 1], [0, 200]),
    headerScale: useTransform(scrollYProgress, [0, 1], [1, 1.1]),
    headerOpacity: useTransform(scrollYProgress, [0, 0.5], [1, 0]),
  };
}