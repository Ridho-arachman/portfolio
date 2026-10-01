"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export interface PortfolioCounts {
  projects: number;
  certificates: number;
  experience: number;
  skills: number;
}

const ARROW_ICON = (
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

export function ShowcaseSection({ counts }: { counts: PortfolioCounts }) {
  const { t, locale } = useTranslation();

  const bars = [
    { label: t.showcase.labels.projects, value: counts.projects, w: 88 },
    { label: t.showcase.labels.certificates, value: counts.certificates, w: 71 },
    { label: t.showcase.labels.experience, value: counts.experience, w: 47 },
    { label: t.showcase.labels.skills, value: counts.skills, w: 95 },
  ];

  const peak = Math.max(...bars.map((b) => b.value), 1);

  const stats = [
    { value: String(counts.projects), label: t.showcase.statsProjects },
    { value: String(counts.certificates), label: t.showcase.statsCertificates },
    { value: String(counts.experience), label: t.showcase.statsExperience },
    { value: String(counts.skills), label: t.showcase.statsSkills },
  ];

  return (
    <section className="relative mx-auto max-w-[1180px] px-6 py-[clamp(80px,12vw,160px)]">
      <div className="grid grid-cols-1 items-center gap-[clamp(36px,6vw,72px)] min-[980px]:grid-cols-[1fr_1.05fr] min-[980px]:gap-[clamp(36px,6vw,72px)]">
        <div>
          <span className="ascend-eyebrow ascend-reveal" data-reveal>
            {t.showcase.eyebrow}
          </span>
          <h2
            className="ascend-section-title ascend-reveal mt-4"
            data-reveal
            style={{ "--rd": "90ms" } as React.CSSProperties}
          >
            {t.showcase.title}
          </h2>
          <p
            className="ascend-reveal mt-[18px] text-lg leading-[1.65] text-ascend-muted"
            data-reveal
            style={{ "--rd": "180ms" } as React.CSSProperties}
          >
            {t.showcase.description}
          </p>
          <Link
            href={`/${locale}/projects`}
            className="ascend-btn ascend-btn-primary ascend-reveal mt-8"
            data-reveal
            style={{ "--rd": "270ms" } as React.CSSProperties}
          >
            {t.showcase.cta}
            {ARROW_ICON}
          </Link>
        </div>

        <div
          className="ascend-dashboard ascend-reveal p-6"
          data-reveal
          style={{ "--rd": "160ms" } as React.CSSProperties}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-semibold">{t.showcase.dashboardTitle}</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-ascend-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-ascend-accent" />
              {t.showcase.live}
            </span>
          </div>

          <div className="flex h-[150px] items-end gap-2.5 rounded-[14px] border border-ascend-line bg-black/25 px-4 pt-4">
            {bars.map((bar, index) => (
              <div
                key={bar.label}
                className="flex-1 rounded-t-[6px] rounded-b-[3px] bg-gradient-to-b from-ascend-accent to-[rgba(88,28,135,0.9)]"
                style={{
                  height: `${Math.max(22, Math.sqrt(bar.value / peak) * 100)}%`,
                  transformOrigin: "bottom",
                  animation: `ascend-bar-grow .9s cubic-bezier(.22,.7,.2,1) ${index * 90}ms backwards`,
                }}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3.5 text-[13.5px] text-ascend-muted">
            {bars.map((bar) => (
              <div key={bar.label} className="grid grid-cols-[90px_1fr] items-center gap-3.5 min-[560px]:grid-cols-[120px_1fr]">
                <span>{bar.label}</span>
                <span className="flex items-center gap-2.5">
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <span
                      className="ascend-dash-fill"
                      style={{ "--w": `${bar.w}%` } as React.CSSProperties}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right tabular-nums">
                    {bar.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-[clamp(56px,8vw,96px)] grid grid-cols-1 gap-[18px] min-[380px]:grid-cols-1 min-[560px]:grid-cols-2 min-[980px]:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="ascend-card ascend-reveal px-[18px] py-[30px] text-center"
            data-reveal
            style={{ "--rd": `${index * 80}ms` } as React.CSSProperties}
          >
            <div className="ascend-stat-value tabular-nums">{stat.value}</div>
            <div className="mt-2 text-sm text-ascend-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}