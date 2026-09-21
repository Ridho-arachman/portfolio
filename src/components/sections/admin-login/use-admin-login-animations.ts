"use client";

import { useMotionValue, useSpring, useTransform, useReducedMotion, type Variants } from "motion/react";

export const springConfig = { damping: 25, stiffness: 180, mass: 0.6 };

export const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function useAdminLoginAnimations() {
  const prefersReducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-1, 1], prefersReducedMotion ? [0, 0] : [6, -6]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-1, 1], prefersReducedMotion ? [0, 0] : [-6, 6]),
    springConfig,
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return {
    rotateX,
    rotateY,
    handleMouseMove,
    handleMouseLeave,
    containerVariants,
    itemVariants,
  };
}