"use client";

import { useTranslation } from "@/hooks/use-translation";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { CORE_VALUES } from "./constants";
import { ValueCard } from "./value-card";

export function CoreValuesSection() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  return (
    <section className="relative pt-16 md:pt-24 pb-0">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <m.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-8 md:mb-10"
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
