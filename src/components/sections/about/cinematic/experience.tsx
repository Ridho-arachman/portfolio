"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import type { ExperiencePublic } from "@/types/domain";
import { Eyebrow, Reveal, RevealLines } from "./primitives";

/**
 * Flat rule-separated list, not the alternating timeline `/experience` uses.
 * Same row language as the principles list so the page reads as one system.
 */
export function CinematicExperience({
  eyebrow,
  title,
  experiences,
}: {
  eyebrow: string;
  title: string;
  experiences: ExperiencePublic[];
}) {
  const { t, locale } = useTranslation();

  if (experiences.length === 0) return null;

  return (
    <section id="experience" className="relative px-6 py-20 md:py-32 lg:px-12">
      <div className="container mx-auto">
        <Eyebrow>{eyebrow}</Eyebrow>
        <RevealLines
          text={title}
          className="mt-6 max-w-[18ch] font-display text-3xl uppercase leading-[0.95] tracking-tight sm:text-5xl"
        />

        <ul className="mt-16">
          {experiences.map((exp, i) => {
            const isOrg = exp.type === "ORGANIZATION";
            return (
              <Reveal
                key={exp.id}
                as="li"
                index={i}
                y={40}
                className="border-b border-glass-border first:border-t"
              >
                <Link
                  href={`/${locale}/experience/${exp.slug}`}
                  className="group grid grid-cols-1 gap-x-10 gap-y-3 py-8 transition-colors md:grid-cols-[12rem_1fr_auto] md:items-baseline"
                >
                  <span className="font-mono text-xs uppercase tabular-nums tracking-[0.18em] text-text-muted">
                    {exp.period}
                  </span>

                  <span>
                    <span className="block text-xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-accent sm:text-2xl">
                      {exp.role}
                    </span>
                    <span className="mt-2 block text-base text-text-secondary">
                      {exp.company} · {exp.location}
                    </span>
                  </span>

                  <span className="flex items-center gap-3 md:justify-end">
                    <span className="text-xs uppercase tracking-[0.18em] text-text-muted">
                      {isOrg ? t.experience.organization : t.experience.company}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-5 shrink-0 text-text-muted transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-accent"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}