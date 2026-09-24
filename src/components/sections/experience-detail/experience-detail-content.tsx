"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import type { ExperienceListData } from "./constants";
import { EXPERIENCE_DETAIL } from "./constants";
import { useTranslation } from "@/hooks/use-translation";

interface ExperienceDetailContentProps {
  exp: ExperienceListData;
}

export function ExperienceDetailContent({ exp }: ExperienceDetailContentProps) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  return (
    <m.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={prefersReducedMotion ? undefined : { duration: 0.6 }}
    >
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="p-0">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-accent" />
            {t.experienceDetail[EXPERIENCE_DETAIL.achievementsKey]}
          </h2>
          <ul className="space-y-6">
            {exp.description.map((point, idx) => (
              <m.li
                key={idx}
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={prefersReducedMotion ? undefined : { duration: 0.5, delay: idx * 0.1 }}
                className="flex items-start gap-4 text-text-secondary leading-relaxed text-base md:text-lg"
              >
                <span className="mt-2.5 w-2 h-2 rounded-full bg-accent shrink-0 shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
                <span>{point}</span>
              </m.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </m.div>
  );
}