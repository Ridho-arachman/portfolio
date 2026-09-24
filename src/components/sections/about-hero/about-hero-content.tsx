"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { AboutHeroContentProps } from "./constants";
import { useTranslation } from "@/hooks/use-translation";

export function AboutHeroContent({ scrollYProgress }: AboutHeroContentProps) {
  const { t } = useTranslation();
  return (
    <div
      className="relative z-10 container mx-auto px-4 text-center max-w-4xl animate-fade-in-up"
      style={{
        transform: `translateY(${scrollYProgress * -100}px) scale(${1 - scrollYProgress * 0.1})`,
        opacity: Math.max(0, 1 - scrollYProgress * 2),
      } as React.CSSProperties}
    >
      {/* Breadcrumb Badge */}
      <div className="mb-6 animate-fade-in-up delay-100">
        <Badge
          variant="outline"
          className="px-3 py-1 rounded-full border-accent/30 bg-accent-muted/50 text-accent text-xs font-semibold tracking-wider uppercase"
        >
          {t.about.subtitle}
        </Badge>
      </div>

      {/* Main Heading */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[0.9] animate-fade-in-up delay-200">
        {t.about.heroTitleA}{" "}
        <span className="text-gradient-elegant inline-block relative">
          {t.about.heroTitleAccent}
          <span className="absolute inset-0 blur-3xl bg-accent/20 -z-10 rounded-full scale-150" />
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
        {t.about.description}
      </p>

      {/* Decorative Line */}
      <div className="mt-12 flex items-center justify-center gap-3 animate-fade-in-up delay-400">
        <div className="h-px w-16 bg-linear-to-r from-transparent to-accent/50" />
        <Sparkles className="w-5 h-5 text-accent" />
        <div className="h-px w-16 bg-linear-to-l from-transparent to-accent/50" />
      </div>
    </div>
  );
}