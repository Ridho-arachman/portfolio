import { useScroll, useTransform, type MotionValue } from "framer-motion";

export interface UseExperienceDetailReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  headerY: MotionValue<number>;
  headerScale: MotionValue<number>;
  headerOpacity: MotionValue<number>;
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