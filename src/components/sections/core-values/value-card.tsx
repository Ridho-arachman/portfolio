"use client";

import { Card } from "@/components/ui/card";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { cardVariants, ValueCardProps } from "./constants";
import { useTranslation } from "@/hooks/use-translation";

export function ValueCard({ value, index }: ValueCardProps) {
  const Icon = value.icon;
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation();

  return (
    <m.div
      variants={cardVariants}
      initial={prefersReducedMotion ? undefined : "hidden"}
      whileInView={prefersReducedMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.2 }}
      transition={prefersReducedMotion ? undefined : { delay: index * 0.1 }}
      whileHover={prefersReducedMotion ? undefined : { y: -8 }}
      className="group h-full"
    >
      {/* Menggunakan Card dari shadcn/ui, dengan override class untuk glassmorphism */}
      <Card
        className="h-full p-6 rounded-2xl bg-glass-bg backdrop-blur-xl border border-glass-border overflow-hidden hover:border-accent/40 hover:bg-accent-muted/10 transition-all duration-300"
      >
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
          <Icon className="w-6 h-6 text-accent" />
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
          {t.coreValues[value.titleKey as keyof typeof t.coreValues]}
        </h3>

        <p className="text-sm text-text-secondary leading-relaxed">
          {t.coreValues[value.descKey as keyof typeof t.coreValues]}
        </p>
      </Card>
    </m.div>
  );
}
