"use client";

import { TechMarquee } from "@/components/ui/tech-marquee";
import * as m from "motion/react-m";
import { marqueeVariants, REPLAY_VIEWPORT } from "./constants";

export function AboutMarquee() {
  return (
    <m.div
      variants={marqueeVariants}
      initial="hidden"
      whileInView="visible"
      viewport={REPLAY_VIEWPORT}
      className="mt-12"
    >
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-text-muted uppercase tracking-widest">
          Technologies I Work With
        </p>
      </div>
      <TechMarquee />
    </m.div>
  );
}
