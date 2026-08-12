"use client";

import { useIsMobile } from "@/hooks/use-is-mobile"; // Pastikan path ini benar
import { useRef } from "react";
import { HeroBackground } from "./hero-background";
import { HeroContent } from "./hero-content";
import { useHeroAnimations } from "./use-hero-animations";

export function HeroSection() {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  // Ambil semua logika animasi dari custom hook
  const animations = useHeroAnimations(containerRef, isMobile);

  return (
    <section
      ref={containerRef}
      onMouseMove={animations.handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden perspective-1000"
    >
      {/* 1. Render Background Elements */}
      <HeroBackground
        bgY={animations.bgY}
        bgScale={animations.bgScale}
        gridY={animations.gridY}
        gridOpacity={animations.gridOpacity}
      />

      {/* 2. Render Main Content */}
      <HeroContent
        textY={animations.textY}
        textOpacity={animations.textOpacity}
        textBlur={animations.textBlur}
        rotateX={animations.rotateX}
        rotateY={animations.rotateY}
        isMobile={isMobile}
        containerVariants={animations.containerVariants}
        itemVariants={animations.itemVariants}
      />
    </section>
  );
}
