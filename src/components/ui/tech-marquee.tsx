"use client";

import type { ComponentType } from "react";
import {
  SiBetterauth,
  SiFramer,
  SiLaravel,
  SiNextdotjs,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiShadcnui,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiZod,
} from "react-icons/si";
import { resolveIcon } from "@/lib/icon-resolver";

export interface MarqueeItem {
  name: string;
  iconName?: string | null;
}

interface FallbackTech {
  name: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const techStack = [
  { name: "Next.js", icon: SiNextdotjs },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Tailwind CSS", icon: SiTailwindcss },
  { name: "Prisma", icon: SiPrisma },
  { name: "React", icon: SiReact },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "Supabase", icon: SiSupabase },
  { name: "Framer Motion", icon: SiFramer },
  { name: "Zod", icon: SiZod },
  { name: "Vercel", icon: SiVercel },
  { name: "Laravel", icon: SiLaravel },
  { name: "Shadcn/ui", icon: SiShadcnui },
  { name: "Better Auth", icon: SiBetterauth },
];

export const DEFAULT_MARQUEE_ITEMS = techStack.map(({ name }) => ({ name }));

export function buildMarqueeItems(base: Array<{ name: string; iconName?: string | null }>, minTrackItems = 12) {
  const source = base.length > 0 ? base : [
    { name: "Next.js" },
    { name: "TypeScript" },
    { name: "Tailwind CSS" },
    { name: "Prisma" },
    { name: "React" },
    { name: "PostgreSQL" },
    { name: "Supabase" },
    { name: "Framer Motion" },
    { name: "Zod" },
    { name: "Vercel" },
    { name: "Laravel" },
    { name: "Shadcn/ui" },
    { name: "Better Auth" },
  ];
  const copies = Math.max(2, Math.ceil(minTrackItems / source.length));
  const half = Array.from({ length: copies }, () => source).flat();
  return [...half, ...half];
}


interface MarqueeCardShellProps {
  name: string;
  children: React.ReactNode;
}

function MarqueeCardShell({ name, children }: MarqueeCardShellProps) {
  return (
    <div className="flex flex-col items-center gap-3 min-w-25 md:min-w-30 group">
      <div className="relative p-4 rounded-2xl bg-glass-bg border border-glass-border group-hover:border-accent/50 group-hover:bg-accent-muted transition-all duration-300">
        {children}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(167,139,250,0.2)] pointer-events-none" />
      </div>
      <span className="text-xs md:text-sm font-medium text-text-muted group-hover:text-text-primary transition-colors text-center leading-tight">
        {name}
      </span>
    </div>
  );
}

type IconComponent = ComponentType<{ size?: number; className?: string }>;

const fallbackIconByName = new Map<string, IconComponent>(
  techStack.map((tech) => [tech.name, tech.icon]),
);

function renderIcon(tech: { name: string; iconName?: string | null }, dynamicItems: typeof DEFAULT_MARQUEE_ITEMS | undefined) {
  if (dynamicItems) {
    if (tech.iconName) {
      const ResolvedIcon = resolveIcon(tech.iconName);
      if (ResolvedIcon) {
        return (
          <ResolvedIcon
            size={32}
            aria-hidden="true"
            className="text-text-secondary group-hover:text-accent transition-colors duration-300"
          />
        );
      }
      return (
        <span className="flex h-8 w-8 items-center justify-center text-base font-bold text-text-secondary group-hover:text-accent transition-colors duration-300">
          {getInitials(tech.name)}
        </span>
      );
    }
    return (
      <span className="flex h-8 w-8 items-center justify-center text-base font-bold text-text-secondary group-hover:text-accent transition-colors duration-300">
        {getInitials(tech.name)}
      </span>
    );
  } else {
    const FallbackIcon = fallbackIconByName.get(tech.name) ?? SiReact;
    return <FallbackIcon size={32} aria-hidden="true" className="text-text-secondary group-hover:text-accent transition-colors duration-300" />;
  }
}

export function TechMarquee({ items }: { items?: MarqueeItem[] }) {
  const dynamicItems = items && items.length > 0 ? items : undefined;
  const duplicatedStack = buildMarqueeItems(dynamicItems ?? []);

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-linear-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-linear-to-l from-bg-primary to-transparent z-10 pointer-events-none" />

      <div className="flex gap-8 md:gap-12 w-max animate-marquee">
        {duplicatedStack.map((tech, index) => (
          <div key={`${tech.name}-${index}`} className="flex flex-col items-center gap-3 min-w-25 md:min-w-30 group">
            <div className="relative p-4 rounded-2xl bg-glass-bg border border-glass-border group-hover:border-accent/50 group-hover:bg-accent-muted transition-all duration-300">
              {renderIcon(tech, dynamicItems)}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(167,139,250,0.2)] pointer-events-none" />
            </div>
            <span className="text-xs md:text-sm font-medium text-text-muted group-hover:text-text-primary transition-colors text-center leading-tight">
              {tech.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}