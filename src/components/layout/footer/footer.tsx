"use client";

import * as m from "motion/react-m";
import { FooterBottom } from "./footer-bottom";
import { FooterBrand } from "./footer-brand";
import { FooterLinks } from "./footer-links";
import { FooterSocial } from "./footer-social";
import { FOOTER_VIEWPORT } from "./use-footer-animations";

export function Footer() {
  return (
    <m.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={FOOTER_VIEWPORT}
      transition={{ duration: 0.8 }}
      className="relative border-t border-glass-border bg-bg-secondary/80 backdrop-blur-xl"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent to-transparent" />

      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <FooterBrand />
          <FooterLinks />
          <FooterSocial />
        </div>

        <FooterBottom />
      </div>
    </m.footer>
  );
}
