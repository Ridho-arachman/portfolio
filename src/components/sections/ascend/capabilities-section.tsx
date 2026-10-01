"use client";

import Link from "next/link";
import {
  Award,
  Briefcase,
  FolderKanban,
  Mail,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Locale } from "@/lib/i18n";

const CAPABILITY_ORDER = [
  "projects",
  "experience",
  "certificates",
  "skills",
  "about",
  "contact",
] as const;

type CapabilityKey = (typeof CAPABILITY_ORDER)[number];

const CAPABILITY_ICONS: Record<CapabilityKey, LucideIcon> = {
  projects: FolderKanban,
  experience: Briefcase,
  certificates: Award,
  skills: Wrench,
  about: User,
  contact: Mail,
};

function buildHref(locale: Locale, key: CapabilityKey) {
  if (key === "skills" || key === "about") return `/${locale}/about`;
  return `/${locale}/${key}`;
}

export function CapabilitiesSection() {
  const { t, locale } = useTranslation();
  const capabilities = t.capabilities;

  return (
    <section className="relative mx-auto max-w-[1180px] px-6 py-[clamp(80px,12vw,160px)]">
      <div className="mx-auto mb-[clamp(48px,6vw,80px)] max-w-[680px] text-center">
        <span className="ascend-eyebrow ascend-reveal" data-reveal>
          {capabilities.eyebrow}
        </span>
        <h2
          className="ascend-section-title ascend-reveal mt-4"
          data-reveal
          style={{ "--rd": "80ms" } as React.CSSProperties}
        >
          {capabilities.title}
        </h2>
        <p
          className="ascend-reveal mt-[18px] text-lg leading-[1.65] text-ascend-muted"
          data-reveal
          style={{ "--rd": "160ms" } as React.CSSProperties}
        >
          {capabilities.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-[18px] min-[560px]:grid-cols-2 min-[980px]:grid-cols-3">
        {CAPABILITY_ORDER.map((key, index) => {
          const Icon = CAPABILITY_ICONS[key];
          return (
            <Link
              key={key}
              href={buildHref(locale, key)}
              className="ascend-card ascend-reveal group block p-[30px]"
              data-reveal
              style={{ "--rd": `${index * 90}ms` } as React.CSSProperties}
            >
              <span className="mb-5 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-[rgba(var(--ascend-accent-rgb),0.18)] bg-[rgba(var(--ascend-accent-rgb),0.1)] text-ascend-accent">
                <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
              </span>
              <h3 className="text-[19px] font-bold">{capabilities[key].title}</h3>
              <p className="mt-2.5 text-[15px] leading-[1.6] text-ascend-muted">
                {capabilities[key].description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export type { CapabilityKey };