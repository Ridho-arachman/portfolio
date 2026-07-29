"use client";

import { Button } from "@/components/ui/button";
import * as m from "motion/react-m";
import Link from "next/link";
import { SOCIAL_LINKS } from "./constants";
import { FOOTER_VIEWPORT } from "./use-footer-animations";

export function FooterSocial() {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={FOOTER_VIEWPORT}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
    >
      <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
        Connect
      </h4>
      <div className="flex gap-3">
        {SOCIAL_LINKS.map(({ href, icon: Icon, label }, index) => (
          <m.div
            key={label}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={FOOTER_VIEWPORT}
            transition={{
              duration: 0.4,
              delay: 0.3 + index * 0.1,
              ease: "easeOut",
            }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="relative w-10 h-10 rounded-lg border-glass-border bg-glass-bg hover:border-accent/50 hover:bg-accent-muted hover:text-accent transition-all duration-300 group overflow-hidden"
            >
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-full h-full"
              >
                <Icon
                  size={20}
                  className="relative z-10 transition-colors duration-300"
                />
                {/* Glow effect on hover */}
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(167,139,250,0.3)]" />
              </Link>
            </Button>
          </m.div>
        ))}
      </div>
    </m.div>
  );
}
