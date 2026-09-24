"use client";

import { AboutAvatar } from "./about-avatar";
import { AboutBackground } from "./about-background";
import { AboutContent } from "./about-content";
import { AboutMarquee } from "./about-marquee";
import { useTranslation } from "@/hooks/use-translation";


export function AboutSection() {
  const { t } = useTranslation();
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <AboutBackground />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t.about.title}{" "}
            <span className="text-gradient-elegant">{t.about.titleAccent}</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg animate-fade-in-up delay-100">
            {t.about.description}
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center mb-20">
          <AboutAvatar />
          <AboutContent />
        </div>

        {/* Tech Stack Marquee */}
        <AboutMarquee />
      </div>
    </section>
  );
}
