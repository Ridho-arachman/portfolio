"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { Experience } from "./constants";
import { ExperienceTimeline } from "./experience-timeline";

export function ExperienceSection({
  experiences,
}: {
  experiences: Experience[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { t, locale } = useTranslation();

  return (
    <section
      ref={sectionRef}
      className="relative pt-0 pb-20 md:pb-32 overflow-hidden"
    >
      <div className="container relative z-10 mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t.experience.title}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            {t.experience.subtitle}
          </p>
        </div>

        {/* Timeline & Cards */}
        <ExperienceTimeline experiences={experiences} />

        {/* Bottom CTA (Shadcn UI Button) */}
        <div className="text-center mt-16 md:mt-24 animate-fade-in-up delay-400">
          <Button
            size="lg"
            className="rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300 group min-h-[48px] min-w-[48px]"
          >
            <Link
              href={`/${locale}/experience`}
              className="inline-flex items-center gap-2"
            >
              {t.experience.viewAll}
              <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
