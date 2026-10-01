"use client";

import { useStill } from "./primitives";

export function CinematicMarquee({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  const still = useStill();

  if (items.length === 0) return null;

  return (
    <section
      aria-label={label}
      className="overflow-hidden border-y border-glass-border py-8"
    >
      <div
        className="flex w-max flex-nowrap"
        style={
          still
            ? undefined
            : { animation: "marquee 22s linear infinite" }
        }
      >
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0">
            {items.map((item) => (
              <span key={`${copy}-${item}`} className="flex items-center">
                <span className="font-display text-2xl uppercase tracking-tight md:text-3xl">
                  {item}
                </span>
                <span
                  aria-hidden
                  className="mx-8 size-2.5 shrink-0 rounded-full bg-accent"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}