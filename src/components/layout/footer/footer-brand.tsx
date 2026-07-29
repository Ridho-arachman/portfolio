"use client";

import * as m from "motion/react-m";
import { FOOTER_VIEWPORT } from "./use-footer-animations";

export function FooterBrand() {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={FOOTER_VIEWPORT}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h3 className="text-2xl font-bold text-linear-elegant mb-3">Ridho.dev</h3>
      <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
        Information Systems student crafting immersive web experiences with
        modern tech stacks.
      </p>
    </m.div>
  );
}
