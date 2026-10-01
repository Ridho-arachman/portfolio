"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

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

export function CtaSection() {
  const { t, locale } = useTranslation();

  return (
    <section className="relative mx-auto max-w-[1180px] px-6 py-[clamp(80px,12vw,160px)]">
      <div
        className="ascend-dashboard mx-auto max-w-[760px] px-[clamp(28px,5vw,64px)] py-[clamp(48px,7vw,80px)] text-center"
        style={{
          background:
            "radial-gradient(120% 140% at 50% 0%, rgba(var(--ascend-accent-rgb),.12), transparent 55%), var(--color-ascend-glass-2)",
        }}
      >
        <span
          className="ascend-eyebrow ascend-reveal"
          data-reveal
          style={{ "--rd": "60ms" } as React.CSSProperties}
        >
          {t.contact.title}
        </span>
        <h2
          className="ascend-section-title ascend-reveal mt-4"
          data-reveal
          style={{ "--rd": "140ms" } as React.CSSProperties}
        >
          {t.contact.subtitle}
        </h2>
        <p
          className="ascend-reveal mx-auto mt-[18px] max-w-[520px] text-lg leading-[1.65] text-ascend-muted"
          data-reveal
          style={{ "--rd": "220ms" } as React.CSSProperties}
        >
          {t.contact.description}
        </p>
        <div
          className="ascend-reveal mt-8 flex flex-col justify-center gap-3.5 min-[560px]:flex-row"
          data-reveal
          style={{ "--rd": "300ms" } as React.CSSProperties}
        >
          <Link
            href={`/${locale}/contact`}
            className="ascend-btn ascend-btn-primary min-h-[52px]"
          >
            {t.hero.ctaSecondary}
            <ArrowIcon />
          </Link>
          <a
            href={`/${locale}/projects`}
            className="ascend-btn ascend-btn-outline min-h-[52px]"
          >
            {t.projects.viewAll}
          </a>
        </div>
      </div>
    </section>
  );
}