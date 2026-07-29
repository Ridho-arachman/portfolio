"use client";

import * as m from "motion/react-m";
import { FOOTER_VIEWPORT } from "./use-footer-animations";

export function FooterBottom() {
  const currentYear = new Date().getFullYear();

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={FOOTER_VIEWPORT}
      transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
      className="pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-center gap-4"
    >
      <p className="text-text-muted text-sm text-center md:text-left">
        © {currentYear} Ridho Arachman. Built with{" "}
        <span className="text-accent font-medium">Next.js</span> &{" "}
        <span className="text-accent font-medium">Tailwind v4</span>.
      </p>

      <div className="flex items-center gap-2 text-text-muted text-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
        </span>
        <span>System Online</span>
      </div>
    </m.div>
  );
}
