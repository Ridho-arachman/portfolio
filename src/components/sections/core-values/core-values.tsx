"use client";

import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { CORE_VALUES, REPLAY_VIEWPORT } from "./constants";
import { ValueCard } from "./value-card";
import { useTranslation } from "@/hooks/use-translation";

export function CoreValuesSection() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  return (
    <section className="relative py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <m.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t.coreValues.title}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {t.coreValues.subtitle}
          </p>
        </m.div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CORE_VALUES.map((value, index) => (
            <ValueCard key={value.titleKey} value={value} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
