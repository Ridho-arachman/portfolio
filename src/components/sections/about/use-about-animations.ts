import { useScroll, useTransform } from "framer-motion";

export function useAboutAnimations() {
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end start"],
  });

  const blobY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const avatarY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return { blobY, avatarY, textY };
}
