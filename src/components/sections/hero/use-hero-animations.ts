import {
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { type RefObject, useEffect, useRef } from "react";

export function useHeroAnimations(
  containerRef: RefObject<HTMLDivElement | null>,
  isMobile: boolean,
) {
  const { scrollY } = useScroll();

  // Scroll Parallax - transform-only properties for compositor thread
  const bgY = useTransform(scrollY, [0, 600], [0, 250]);
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.3]);
  const textY = useTransform(scrollY, [0, 600], [0, -150]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  // Avoid filter animations on main thread - use opacity instead
  // const textBlur = useTransform(scrollY, [0, 500], ["blur(0px)", "blur(10px)"]);

  const gridY = useTransform(scrollY, [0, 600], [100, 400]);
  const gridOpacity = useTransform(scrollY, [0, 300], [0, 0.3]);

  // Mouse 3D Tilt - cache rect to avoid forced reflow on every mousemove
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rectRef = useRef<DOMRect | null>(null);

  // Update rect on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;
    rectRef.current = containerRef.current.getBoundingClientRect();
    const handleResize = () => {
      if (containerRef.current) {
        rectRef.current = containerRef.current.getBoundingClientRect();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [containerRef]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !containerRef.current || !rectRef.current) return;
    const { left, top, width, height } = rectRef.current;
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

  // Animation Variants - reduce blur/filter animations for performance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "circOut" },
    },
  };

  return {
    bgY,
    bgScale,
    textY,
    textOpacity,
    // textBlur removed - filter animations are expensive
    gridY,
    gridOpacity,
    rotateX,
    rotateY,
    handleMouseMove,
    containerVariants,
    itemVariants,
  };
}
