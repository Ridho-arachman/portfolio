"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { QUICK_LINKS } from "./constants";
import { FOOTER_VIEWPORT } from "./use-footer-animations";

export function FooterLinks() {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={FOOTER_VIEWPORT}
      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
    >
      <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
        Quick Links
      </h4>
      <ul className="space-y-3">
        {QUICK_LINKS.map((item, idx) => (
          <m.li
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={FOOTER_VIEWPORT}
            transition={{ duration: 0.4, delay: 0.2 + idx * 0.08 }}
          >
            <Link
              href={item.href}
              className="text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-2 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
              {item.label}
            </Link>
          </m.li>
        ))}
      </ul>
    </m.div>
  );
}
