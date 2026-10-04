"use client";

import { createElement } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { resolveIconForSkill } from "@/lib/icon-resolver";
import { TECH_STACK } from "./constants";
import { Locale } from "@/lib/i18n";

export interface HeroSkill {
  id: string;
  name: string;
  iconName?: string | null;
}

function ArrowIcon() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function HeroContent({ locale, skills }: { locale: Locale; skills: HeroSkill[] }) {
  const { t } = useTranslation();

  const items =
    skills.length > 0
      ? skills.map((skill) => ({ key: skill.id, label: skill.name, icon: resolveIconForSkill(skill) }))
      : TECH_STACK.map((tech) => ({ key: tech, label: tech, icon: null }));
  const track = [...items, ...items];

  return (
    <div className="flex min-h-[100dvh] w-full flex-col px-4 pt-24">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span
          className="ascend-reveal inline-flex items-center gap-1.5 rounded-full border border-[rgba(var(--ascend-accent-rgb),0.3)] bg-[rgba(var(--ascend-accent-rgb),0.08)] px-4 py-2 text-xs font-medium uppercase tracking-wider text-ascend-accent"
          data-reveal
          style={{ "--rd": "0ms" } as React.CSSProperties}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="relative inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-ascend-accent" />
          </span>
          {t.hero.available}
        </span>

        <h1
          className="ascend-hero-title ascend-reveal mt-8"
          data-reveal
          style={{ "--rd": "60ms" } as React.CSSProperties}
        >
          {t.hero.title}
          <br />
          <em>{t.hero.typewriter[0]}</em>
        </h1>

        <p
          className="ascend-reveal mt-6 max-w-[560px] text-[clamp(16px,2vw,19px)] leading-[1.6] text-ascend-muted"
          data-reveal
          style={{ "--rd": "180ms" } as React.CSSProperties}
        >
          {t.hero.description}
        </p>

        <div
          className="ascend-reveal mt-[38px] flex w-full max-w-md flex-col gap-3.5 min-[560px]:flex-row min-[560px]:justify-center"
          data-reveal
          style={{ "--rd": "300ms" } as React.CSSProperties}
        >
          <Link
            href={`/${locale}/projects`}
            className="ascend-btn ascend-btn-primary min-h-[52px] flex-1"
          >
            {t.hero.ctaPrimary}
            <ArrowIcon />
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="ascend-btn ascend-btn-outline min-h-[52px] flex-1"
          >
            {t.hero.ctaSecondary}
          </Link>
        </div>
      </div>

      <div
        className="ascend-reveal px-6 pt-[clamp(24px,3vw,40px)] pb-[clamp(36px,6vw,64px)]"
        data-reveal
        style={{ "--rd": "420ms" } as React.CSSProperties}
      >
        <div
          className="overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          }}
        >
          <div className="ascend-marquee-track w-max">
            {track.map((item, index) => (
              <span
                key={`${item.key}-${index}`}
                className="flex items-center gap-2 whitespace-nowrap text-[17px] font-bold text-ascend-muted-2 opacity-80 transition-colors hover:text-ascend-ink hover:opacity-100"
              >
                {item.icon
                  ? createElement(item.icon, { size: 20, "aria-hidden": true })
                  : null}
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}