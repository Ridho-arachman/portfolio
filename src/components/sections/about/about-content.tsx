"use client";

import { AboutContentProps, HIGHLIGHT_POINTS_KEYS } from "./constants";
import { useTranslation } from "@/hooks/use-translation";

export function AboutContent({}: AboutContentProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 animate-fade-in-up delay-300">
      <h3 className="text-2xl md:text-3xl font-bold text-text-primary">
        {t.about.greeting}{" "}
        <span className="text-accent">Ridho Arachman</span>
      </h3>

      <p className="text-text-secondary leading-relaxed text-lg">
        {t.about.p1}
      </p>

      <p className="text-text-secondary max-w-2xl mx-auto text-lg">
        {t.about.p2}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {HIGHLIGHT_POINTS_KEYS.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-glass-border transition-all duration-300 cursor-default animate-fade-in-up delay-400"
          >
            <item.icon className="w-5 h-5 text-accent mt-1 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {t.about[item.titleKey as keyof typeof t.about]}
              </p>
              <p className="text-xs text-text-muted">
                {t.about[item.descKey as keyof typeof t.about]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}