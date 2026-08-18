"use client";

import { useScroll, useTransform } from "framer-motion";
import * as m from "motion/react-m";
import { useRef } from "react";
import { ExperienceCard } from "./experience-card";
import type { Experience } from "./constants";

export function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scaleY = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  return (
    <div ref={containerRef} className="relative max-w-5xl mx-auto">
      {/* Static Background Line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-glass-border -translate-x-1/2" />
      
      {/* Animated Progress Line */}
      <m.div
        style={{ scaleY, transformOrigin: "top" }}
        className="absolute left-4 md:left-1/2 top-0 w-px bg-accent -translate-x-1/2 shadow-[0_0_10px_rgba(167,139,250,0.5)]"
      />

      {/* Cards List */}
      <div className="space-y-12 md:space-y-16">
        {experiences.map((exp, index) => (
          <ExperienceCard
            key={exp.id}
            exp={exp}
            index={index}
            isLeft={index % 2 === 0}
          />
        ))}
      </div>
    </div>
  );
}