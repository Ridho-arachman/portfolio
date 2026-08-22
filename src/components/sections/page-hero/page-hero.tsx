"use client";

import { AboutHeroBackground } from "@/components/sections/about-hero/about-hero-background";
import { FloatingTechIcon } from "@/components/sections/about-hero/floating-tech-icon";
import { useAboutHeroAnimations } from "@/components/sections/about-hero/use-about-hero-animations";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import * as m from "motion/react-m";
import { PAGE_HERO_ICONS, type PageHeroProps } from "./constants";

// Posisi & konfigurasi ikon mengapung — identik dengan AboutHeroSection
// agar bahasa visual antar halaman konsisten.
const ICON_SLOTS = [
  "absolute top-1/4 left-[15%] hidden md:block",
  "absolute top-1/3 right-[20%] hidden md:block",
  "absolute bottom-1/3 left-[25%] hidden md:block",
] as const;

const FLOAT_CONFIG = [
  { intensity: 40, floatDuration: 5, scrollIntensity: 250 },
  { intensity: 25, floatDuration: 4, scrollIntensity: 180 },
  { intensity: 60, floatDuration: 6, scrollIntensity: 220 },
] as const;

/**
 * Hero halaman publik yang mengadopsi penuh desain AboutHeroSection:
 * latar blob parallax + grid perspektif + noise, badge pill, judul raksasa
 * bergradasi dengan glow, subjudul, dan garis dekoratif Sparkles.
 */
export function PageHero({
  badge,
  title,
  titleAccent,
  description,
  iconSet,
}: PageHeroProps) {
  const icons = iconSet ? PAGE_HERO_ICONS[iconSet] : [];
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
      {/* Latar belakang parallax */}
      <AboutHeroBackground
        bgY1={bgY1}
        bgY2={bgY2}
        bgY3={bgY3}
        mouseX={mouseX}
        mouseY={mouseY}
      />

      {/* Ikon mengapung (maks. 3) */}
      {icons.slice(0, 3).map((Icon, i) => (
        <FloatingTechIcon
          key={`${badge}-icon-${i}`}
          icon={Icon}
          mouseX={mouseX}
          mouseY={mouseY}
          scrollY={scrollYProgress}
          intensity={FLOAT_CONFIG[i].intensity}
          floatDuration={FLOAT_CONFIG[i].floatDuration}
          scrollIntensity={FLOAT_CONFIG[i].scrollIntensity}
          className={ICON_SLOTS[i]}
        />
      ))}

      {/* Konten utama */}
      <m.div
        style={{ y: textY, opacity: textOpacity, scale: textScale }}
        className="relative z-10 container mx-auto px-4 text-center max-w-4xl"
      >
        <m.div variants={containerVariants} initial="hidden" animate="visible">
          <m.div variants={itemVariants} className="mb-6">
            <Badge
              variant="outline"
              className="px-4 py-2 rounded-full border-accent/30 bg-accent-muted/50 text-accent text-xs font-semibold tracking-wider uppercase"
            >
              {badge}
            </Badge>
          </m.div>

          <m.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[0.9]"
          >
            {title}{" "}
            <span className="text-gradient-elegant inline-block relative">
              {titleAccent}
              <span className="absolute inset-0 blur-3xl bg-accent/20 -z-10 rounded-full scale-150" />
            </span>
          </m.h1>

          <m.p
            variants={itemVariants}
            className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            {description}
          </m.p>

          {/* Garis dekoratif */}
          <m.div
            variants={itemVariants}
            className="mt-12 flex items-center justify-center gap-3"
          >
            <div className="h-px w-16 bg-linear-to-r from-transparent to-accent/50" />
            <Sparkles className="w-5 h-5 text-accent" />
            <div className="h-px w-16 bg-linear-to-l from-transparent to-accent/50" />
          </m.div>
        </m.div>
      </m.div>
    </section>
  );
}
