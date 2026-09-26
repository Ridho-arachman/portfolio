"use client";

import { AboutHeroBackground } from "@/components/sections/about-hero/about-hero-background";
import { FloatingTechIcon } from "@/components/sections/about-hero/floating-tech-icon";
import { useAboutHeroAnimations } from "@/components/sections/about-hero/use-about-hero-animations";
import { Badge } from "@/components/ui/badge";
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
 * bergradasi dengan glow, subjudul, dan garis dekoratif aksen.
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
          intensity={FLOAT_CONFIG[i].intensity}
          floatDuration={FLOAT_CONFIG[i].floatDuration}
          scrollIntensity={FLOAT_CONFIG[i].scrollIntensity}
          className={ICON_SLOTS[i]}
        />
      ))}

      {/* Konten utama */}
      <div
        className="relative z-10 container mx-auto px-4 text-center max-w-4xl"
        style={{
          transform: `translateY(${scrollYProgress * -100}px) scale(${1 - scrollYProgress * 0.1})`,
          opacity: Math.max(0, 1 - scrollYProgress * 2),
        } as React.CSSProperties}
      >
        <div className="animate-rise-in">
          <div className="mb-6 animate-rise-in delay-100">
            <Badge
              variant="outline"
              className="px-4 py-2 rounded-full border-accent/30 bg-accent-muted/50 text-accent text-xs font-semibold tracking-wider uppercase"
            >
              {badge}
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[0.9] animate-rise-in delay-200">
            {title}
            {titleAccent ? (
              <>
                {" "}
                <span className="text-gradient-elegant inline-block relative">
                  {titleAccent}
                  <span className="absolute inset-0 blur-3xl bg-accent/20 -z-10 rounded-full scale-150" />
                </span>
              </>
            ) : null}
          </h1>

          <p className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed animate-rise-in delay-300">
            {description}
          </p>

          {/* Garis dekoratif */}
          <div className="mt-12 mx-auto h-px w-24 bg-linear-to-r from-transparent via-accent/50 to-transparent animate-rise-in delay-400" />
        </div>
      </div>
    </section>
  );
}