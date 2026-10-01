"use client";

import Link from "next/link";

import { useTranslation } from "@/hooks/use-translation";
import { Eyebrow, LiquidImage, Reveal, RevealLines } from "./primitives";

export interface Venture {
  slug: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  year?: string;
}

interface CinematicVenturesProps {
  eyebrow: string;
  title: string;
  countLabel: string;
  ventures: Venture[];
  viewLabel: string;
}

export function CinematicVentures({
  eyebrow,
  title,
  countLabel,
  ventures,
  viewLabel,
}: CinematicVenturesProps) {
  const { locale } = useTranslation();

  if (ventures.length === 0) return null;

  return (
    <section id="ventures" className="relative px-6 py-20 md:py-32 lg:px-12">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <RevealLines
              text={title}
              className="mt-6 max-w-[14ch] font-display text-3xl uppercase leading-[0.95] tracking-tight sm:text-5xl"
            />
          </div>
          <span className="text-xs uppercase tracking-[0.22em] text-text-muted">
            {countLabel}
          </span>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2">
          {ventures.map((venture, i) => (
            <Reveal
              key={venture.slug}
              as="li"
              index={i}
              stagger={0.12}
              y={60}
              className={i % 2 === 1 ? "md:mt-24" : undefined}
            >
              <article className="group">
                <Link
                  href={`/${locale}/projects/${venture.slug}`}
                  className="block"
                  aria-label={`${viewLabel}: ${venture.title}`}
                >
                  <LiquidImage
                    alt={venture.title}
                    src={venture.image}
                    width={800}
                    height={550}
                    sizes="(min-width: 768px) 46vw, 100vw"
                    className="aspect-[16/11] w-full rounded-sm"
                  />

                  <div className="mt-6 flex items-start justify-between gap-6 border-t border-glass-border pt-5">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-accent">
                        {venture.title}
                      </h3>
                      <p className="mt-2 max-w-[42ch] text-base text-text-secondary">
                        {venture.description}
                      </p>
                    </div>
                    {venture.year ? (
                      <span className="shrink-0 text-right text-xs uppercase tracking-[0.18em] text-text-muted">
                        {venture.year}
                      </span>
                    ) : null}
                  </div>

                  {venture.tags.length > 0 ? (
                    <p className="mt-3 text-xs uppercase tracking-[0.22em] text-text-muted">
                      {venture.tags.join(" · ")}
                    </p>
                  ) : null}
                </Link>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}