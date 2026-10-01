"use client";

import { Eyebrow, Reveal, RevealLines } from "./primitives";

interface Principle {
  title: string;
  description: string;
}

interface CinematicStoryProps {
  eyebrow: string;
  title: string;
  body: string;
  principles: Principle[];
}

export function CinematicStory({
  eyebrow,
  title,
  body,
  principles,
}: CinematicStoryProps) {
  return (
    <section id="story" className="relative px-6 py-20 md:py-32 lg:px-12">
      <div className="container mx-auto grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <Eyebrow>{eyebrow}</Eyebrow>

          <RevealLines
            text={title}
            className="mt-6 max-w-[22ch] font-display text-3xl uppercase leading-[0.95] tracking-tight sm:text-5xl"
          />

          <Reveal index={1}>
            <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-text-secondary">
              {body}
            </p>
          </Reveal>
        </div>

        <ul className="lg:col-span-6 lg:pt-2">
          {principles.map((principle, i) => (
            <Reveal
              key={principle.title}
              as="li"
              index={i}
              stagger={0.09}
              y={24}
              className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-glass-border py-8 last:border-b"
            >
              <span className="font-mono text-2xl font-semibold tabular-nums text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-tight">
                  {principle.title}
                </h3>
                <p className="mt-3 max-w-[44ch] text-base text-text-secondary">
                  {principle.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}