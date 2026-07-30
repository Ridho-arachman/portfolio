import {
  useMotionValue,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useEffect, useRef } from "react";

export function useAboutHeroAnimations() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Parallax Transforms - Background layers
  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const bgY3 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Text Transforms
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  // Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 80, filter: "blur(20px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: "circOut" },
    },
  };

  return {
    sectionRef,
    scrollYProgress,
    mouseX,
    mouseY,
    bgY1,
    bgY2,
    bgY3,
    textY,
    textOpacity,
    textScale,
    containerVariants,
    itemVariants,
  };
}
