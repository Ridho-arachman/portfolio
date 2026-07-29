import {
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { type RefObject } from "react";

export function useHeroAnimations(
  containerRef: RefObject<HTMLDivElement | null>, // <-- Perbaikan di sini
  isMobile: boolean,
) {
  const { scrollY } = useScroll();

  // Scroll Parallax
  const bgY = useTransform(scrollY, [0, 600], [0, 250]);
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.3]);
  const textY = useTransform(scrollY, [0, 600], [0, -150]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const textBlur = useTransform(scrollY, [0, 500], ["blur(0px)", "blur(10px)"]);

  const gridY = useTransform(scrollY, [0, 600], [100, 400]);
  const gridOpacity = useTransform(scrollY, [0, 300], [0, 0.3]);

  // Mouse 3D Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [8, -8]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-8, 8]),
    springConfig,
  );

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 60, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: "circOut" },
    },
  };

  return {
    bgY,
    bgScale,
    textY,
    textOpacity,
    textBlur,
    gridY,
    gridOpacity,
    rotateX,
    rotateY,
    handleMouseMove,
    containerVariants,
    itemVariants,
  };
}
