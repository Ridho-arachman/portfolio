"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { heroScrollProgress } from "./hero-scroll-progress";

export function useAboutHeroAnimations() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [scrollYProgress, setScrollYProgress] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    // Coalesced to one read + one setState per frame. During a fling, scroll events arrive
    // faster than rAF and every one re-rendered the whole hero subtree. Cost is invisible
    // on a desktop GPU; on a weak phone it competes with the blur for the same frames.
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        setScrollYProgress(heroScrollProgress(rect.bottom, rect.height, viewportHeight));
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth - 0.5) * 2);
      setMouseY((e.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    handleScroll(); // Initial calculation
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion]);

  // CSS-based transform values (computed from scrollYProgress and mouse position)
  const bgY1 = scrollYProgress * 200;
  const bgY2 = scrollYProgress * -150;
  const bgY3 = scrollYProgress * 100;
  const textY = scrollYProgress * -100;
  const textOpacity = Math.max(0, 1 - scrollYProgress * 2);
  const textScale = 1 - scrollYProgress * 0.1;

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
  };
}