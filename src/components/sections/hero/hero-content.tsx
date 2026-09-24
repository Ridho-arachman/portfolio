"use client";

import Link from "next/link";
import { motion, useReducedMotion, useMotionValue } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Locale } from "@/lib/i18n";

const HERO_CODE_SNIPPET = `const buildFuture = () => {
  const stack = ["React", "Next.js", "TypeScript", "Tailwind"];

  return stack.map(tech => ({
    name: tech,
    mastery: "Advanced",
    passion: "High"
  }));
};

buildFuture().forEach(project =>
  shipWithCraft(project)
);`;

interface HeroContentProps {
  locale: Locale;
}

export function HeroContent({ locale }: HeroContentProps) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  const phrases = useMemo(
    () => (t.hero.typewriter.length > 0 ? t.hero.typewriter : [t.hero.title]),
    [t],
  );
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const current = phrases[phraseIndex % phrases.length];
    const doneTyping = !deleting && charCount === current.length;
    const doneDeleting = deleting && charCount === 0;
    const delay = doneTyping ? 1600 : doneDeleting ? 400 : deleting ? 35 : 70;
    const timer = setTimeout(() => {
      if (doneTyping) {
        setDeleting(true);
      } else if (doneDeleting) {
        setDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      } else {
        setCharCount((c) => c + (deleting ? -1 : 1));
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [charCount, deleting, phraseIndex, phrases, prefersReducedMotion]);

  const typedText = prefersReducedMotion
    ? phrases[0]
    : phrases[phraseIndex % phrases.length].slice(0, charCount);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 min-h-[100dvh] flex items-center pt-16">
      <div className="w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="lg:pr-8 text-left scroll-reveal-up" style={{ animationRange: "entry 0% cover 30%" }}>
            <div className="mb-8 scroll-reveal-up delay-200" style={{ animationRange: "entry 0% cover 30%" }}>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass glass-hover border-accent/30 bg-accent-muted/50 text-accent font-medium tracking-wider uppercase text-xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent animate-pulse" />
                </span>
                {t.hero.available}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-[0.9] scroll-reveal-up delay-300" style={{ animationRange: "entry 0% cover 30%" }}>
              {t.hero.greeting}
              <br />
              <span className="text-gradient-accent" aria-hidden="true">
                {typedText}
              </span>
              {!prefersReducedMotion && (
                <span
                  aria-hidden="true"
                  className="inline-block w-[3px] h-[0.9em] ml-2 -mb-[0.05em] bg-accent animate-pulse"
                />
              )}
              <span className="sr-only">{t.hero.title}</span>
            </h1>

            <p className="text-base md:text-lg text-text-secondary max-w-xl mb-10 leading-relaxed scroll-reveal-up delay-400" style={{ animationRange: "entry 0% cover 30%" }}>
              {t.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 scroll-reveal-up delay-500" style={{ animationRange: "entry 0% cover 30%" }}>
              <motion.a
                href={`/${locale}/projects`}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm md:px-10 md:py-5 md:text-base h-auto rounded-full bg-accent text-bg-primary font-semibold transition-all duration-300 min-h-[52px] min-w-[52px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                onMouseMove={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (!prefersReducedMotion) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    mouseX.set(x * 0.3);
                    mouseY.set(y * 0.3);
                  }
                }}
                onMouseLeave={() => {
                  if (!prefersReducedMotion) {
                    mouseX.set(0);
                    mouseY.set(0);
                  }
                }}
                style={{ x: mouseX, y: mouseY }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {t.hero.ctaPrimary}
                <svg className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.a>

              <Link
                href={`/${locale}/contact`}
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-accent/50 px-8 py-4 text-base font-medium text-accent transition-all hover:border-accent hover:bg-accent-muted/10 min-h-[52px] min-w-[52px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 glass glass-hover"
              >
                <motion.svg
                  className="h-5 w-5 shrink-0"
                  animate={{ rotate: prefersReducedMotion ? 0 : 180 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4V1L8 5l4 4V6a8 8 0 01-9 9m9-9a9 9 0 00-9-9m9 9V12" />
                </motion.svg>
                <span>{t.hero.ctaSecondary}</span>
              </Link>
            </div>

            <div className="mt-16 flex items-center gap-2 text-text-muted text-xs uppercase tracking-widest scroll-fade-in" style={{ animationRange: "entry 50% cover 80%" }}>
              <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="hidden sm:inline">{t.hero.scrollDown}</span>
            </div>
          </div>

          <div className="relative lg:pl-8">
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-3xl glass-strong overflow-hidden parallax-slow" style={{ transform: "translateY(0)" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-neon-purple/5" />

                <div className="relative z-10 p-6 md:p-8">
                  <div className="glass rounded-xl p-4 md:p-6 font-mono text-sm leading-relaxed text-text-secondary">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <div className="w-3 h-3 rounded-full bg-chart-3" />
                      <div className="w-3 h-3 rounded-full bg-chart-4" />
                    </div>
                    <pre className="text-text-primary overflow-x-auto"><code>{HERO_CODE_SNIPPET}</code></pre>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-accent/10 blur-[40px] pointer-events-none parallax-medium" />
                <div className="absolute bottom-4 -left-4 w-12 h-12 rounded-full bg-neon-cyan/10 blur-[40px] pointer-events-none parallax-fast" />
              </div>

              <div className="absolute inset-0 rounded-3xl border border-accent/20 pointer-events-none parallax-medium" />

              <div className="absolute -top-4 -right-4 glass px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-accent uppercase hidden lg:block parallax-fast">
                <span className="flex items-center gap-1">
                  <span className="relative h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  {t.hero.livePreview}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 glass px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-neon-cyan uppercase hidden lg:block parallax-medium">
                {t.hero.typeReady}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}