"use client";

import { Code2, Database, Globe } from "lucide-react";
import { AboutHeroBackground } from "./about-hero/about-hero-background";
import { AboutHeroContent } from "./about-hero/about-hero-content";
import { FloatingTechIcon } from "./about-hero/floating-tech-icon";
import { useAboutHeroAnimations } from "./about-hero/use-about-hero-animations";

export function AboutHeroSection() {
  const {
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
  } = useAboutHeroAnimations();

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* 1. Background Elements */}
      <AboutHeroBackground
        bgY1={bgY1}
        bgY2={bgY2}
        bgY3={bgY3}
        mouseX={mouseX}
        mouseY={mouseY}
      />

      {/* 2. Floating Tech Icons */}
      <FloatingTechIcon
        icon={Code2}
        mouseX={mouseX}
        mouseY={mouseY}
        scrollY={scrollYProgress}
        intensity={40}
        floatDuration={5}
        scrollIntensity={250}
        className="absolute top-1/4 left-[15%] hidden md:block"
      />
      <FloatingTechIcon
        icon={Database}
        mouseX={mouseX}
        mouseY={mouseY}
        scrollY={scrollYProgress}
        intensity={25}
        floatDuration={4}
        scrollIntensity={180}
        className="absolute top-1/3 right-[20%] hidden md:block"
      />
      <FloatingTechIcon
        icon={Globe}
        mouseX={mouseX}
        mouseY={mouseY}
        scrollY={scrollYProgress}
        intensity={60}
        floatDuration={6}
        scrollIntensity={220}
        className="absolute bottom-1/3 left-[25%] hidden md:block"
      />

      {/* 3. Main Content */}
      <AboutHeroContent
        textY={textY}
        textOpacity={textOpacity}
        textScale={textScale}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
    </section>
  );
}
