"use client";

import { TechMarquee } from "@/components/ui/tech-marquee";
import { type Variants } from "framer-motion";
import * as m from "motion/react-m";
import { REPLAY_VIEWPORT } from "./use-about-animations";

const marqueeVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

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
