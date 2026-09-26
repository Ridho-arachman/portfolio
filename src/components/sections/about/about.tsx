"use client";

import { AboutAvatar } from "./about-avatar";
import { AboutBackground } from "./about-background";
import { AboutContent } from "./about-content";
import { SkillsSection } from "./skills-section";


export function AboutSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <AboutBackground />

      <div className="container relative z-10 mx-auto px-4">
        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center mb-20">
          <AboutAvatar />
          <AboutContent />
        </div>

        <SkillsSection />
      </div>
    </section>
  );
}
