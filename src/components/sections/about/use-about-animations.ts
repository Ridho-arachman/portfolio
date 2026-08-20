import { useScroll, useTransform } from "framer-motion";
import type { RefObject } from "react";

export function useAboutAnimations(sectionRef: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const blobY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const avatarY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return { blobY, avatarY, textY };
}
