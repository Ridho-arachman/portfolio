"use client";

import * as m from "motion/react-m";

import { EASE_OUT_EXPO, LiquidImage, RevealLetters, useStill } from "./primitives";

interface CinematicHeroProps {
  fullName: string;
  roles: string[];
  bio: string;
  scrollCue: string;
}

/**
 * Two stacked lines of the name in the display face, sitting behind the portrait.
 * The line break is derived from the name itself (given / family), so it holds
 * for any locale and needs no per-person override.
 */
function nameLines(fullName: string): [string, string] {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return [fullName, ""];
  const family = parts.pop()!;
  return [parts.join(" "), family];
}

export function CinematicHero({
  fullName,
  roles,
  bio,
  scrollCue,
}: CinematicHeroProps) {
  const still = useStill();
  const lines = nameLines(fullName).filter(Boolean);

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-5rem)] flex-col overflow-hidden"
    >
      <m.div
        className="relative z-30 flex flex-col gap-8 px-6 pt-28 sm:flex-row sm:items-start sm:justify-between lg:px-12"
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: still ? 0 : 0.6, ease: EASE_OUT_EXPO }}
      >
        <h2 className="font-display text-xl uppercase leading-[1.05] tracking-tight sm:text-2xl">
          {roles.map((role, i) => (
            <span key={role} className="block overflow-hidden">
              <m.span
                className="block"
                initial={still ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: still ? 0 : 0.76,
                  ease: EASE_OUT_EXPO,
                  delay: still ? 0 : 0.2 + i * 0.08,
                }}
              >
                {role}
              </m.span>
            </span>
          ))}
        </h2>

        <m.p
          className="max-w-md text-base text-text-secondary sm:text-right"
          initial={still ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: still ? 0 : 0.52,
            ease: EASE_OUT_EXPO,
            delay: still ? 0 : 0.4,
          }}
        >
          {bio}
        </m.p>
      </m.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[26vh] bg-gradient-to-b from-transparent to-bg-primary" />

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-[46vh] w-[80vw] -translate-x-1/2 sm:h-[86vh] sm:w-[48vw] lg:w-[36vw]"
      >
        <LiquidImage
          alt={fullName}
          src="/avatar-hero.avif"
          width={800}
          height={1000}
          priority
          sizes="(min-width: 1024px) 36vw, (min-width: 640px) 48vw, 80vw"
          veil={false}
          maxScale={30}
          className="pointer-events-auto h-full w-full bg-transparent"
        />
      </div>

      <h1 className="font-display absolute inset-x-0 bottom-0 z-10 flex translate-y-[6%] flex-col items-center text-[clamp(2.25rem,8.5vw,13rem)] uppercase leading-[0.86] text-accent">
        <RevealLetters lines={lines} />
      </h1>

      <m.div
        className="absolute bottom-8 left-6 z-30 inline-flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-text-muted lg:left-12"
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: still ? 0 : 0.6,
          ease: EASE_OUT_EXPO,
          delay: still ? 0 : 0.9,
        }}
      >
        <span aria-hidden className="h-10 w-px bg-accent" />
        {scrollCue}
      </m.div>
    </section>
  );
}