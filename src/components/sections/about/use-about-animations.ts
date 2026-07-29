import { useScroll, useTransform, type ViewportOptions } from "framer-motion";

export const REPLAY_VIEWPORT: ViewportOptions = {
  once: false,
  amount: 0.2,
  margin: "0px 0px -100px 0px",
};

export function useAboutAnimations() {
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end start"],
  });

  const blobY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const avatarY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return { blobY, avatarY, textY };
}
