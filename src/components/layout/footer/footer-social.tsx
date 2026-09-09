"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SOCIAL_LINKS } from "./constants";

export function FooterSocial() {
  return (
    <div className="animate-fade-in-up delay-200">
      <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
        Connect
      </h4>
      <div className="flex gap-3">
        {SOCIAL_LINKS.map(({ href, icon: Icon, label }, index) => (
          <div
            key={label}
            className="animate-fade-in-up"
            style={{ animationDelay: `${300 + index * 100}ms` }}
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
          </div>
        ))}
      </div>
    </div>
  );
}