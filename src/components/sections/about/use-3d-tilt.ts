import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { type MouseEvent } from "react";

export function use3dTilt() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for natural movement
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Parallax transforms
  const bgX = useTransform(smoothX, [-200, 200], [-40, 40]);
  const bgY = useTransform(smoothY, [-200, 200], [-40, 40]);
  const imgRotateX = useTransform(smoothY, [-200, 200], [6, -6]);
  const imgRotateY = useTransform(smoothX, [-200, 200], [-6, 6]);
  const imgTranslateX = useTransform(smoothX, [-200, 200], [-10, 10]);
  const imgTranslateY = useTransform(smoothY, [-200, 200], [-10, 10]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return {
    bgX,
    bgY,
    imgRotateX,
    imgRotateY,
    imgTranslateX,
    imgTranslateY,
    handleMouseMove,
    handleMouseLeave,
  };
}
