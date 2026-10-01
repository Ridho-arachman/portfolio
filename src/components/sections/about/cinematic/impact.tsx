"use client";

import { Eyebrow, Reveal, RevealLines } from "./primitives";

export interface Stat {
  value: string;
  label: string;
}

interface CinematicImpactProps {
  eyebrow: string;
  title: string;
  stats: Stat[];
}

export function CinematicImpact({ eyebrow, title, stats }: CinematicImpactProps) {
  return (
    <section id="impact" className="relative px-6 py-20 md:py-32 lg:px-12">
      <div className="container mx-auto">
        <Eyebrow>{eyebrow}</Eyebrow>
        <RevealLines
          text={title}
          className="mt-6 font-display text-3xl uppercase leading-none tracking-tight sm:text-5xl"
        />

        <dl className="mt-16 grid grid-cols-1 border-t border-glass-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              as="div"
              index={i}
              stagger={0.11}
              className={`flex flex-col gap-4 border-b border-glass-border py-10 lg:py-12 ${
                i % 2 === 1 ? "sm:border-l sm:pl-8" : ""
              } ${i % 4 !== 0 ? "lg:border-l lg:pl-8" : ""}`}
            >
              <dd className="font-display text-5xl leading-none tracking-tight transition-colors duration-300 hover:text-accent lg:text-6xl">
                {stat.value}
              </dd>
              <dt className="max-w-[20ch] text-base uppercase leading-relaxed tracking-[0.14em] text-text-muted">
                {stat.label}
              </dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}