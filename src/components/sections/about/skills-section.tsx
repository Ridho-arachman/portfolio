"use client";

import { createElement, useMemo } from "react";
import { usePublicSkills } from "@/hooks/use-skills";
import { useTranslation } from "@/hooks/use-translation";
import { resolveIcon } from "@/lib/icon-resolver";
import { groupSkillsByCategory } from "@/lib/utils/skill-group";
import type { AdminSkill } from "@/components/sections/admin-skills/constants";

function SkillRow({ skill }: { skill: AdminSkill }) {
  const icon = skill.iconName ? resolveIcon(skill.iconName) : null;

  return (
    <li>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="flex items-center gap-2 min-w-0 text-sm font-medium text-text-primary">
          {icon
            ? createElement(icon, {
                size: 16,
                "aria-hidden": true,
                className: "shrink-0 text-text-secondary",
              })
            : null}
          <span className="truncate">{skill.name}</span>
        </span>
        <span className="shrink-0 font-mono tabular-nums text-xs text-text-muted">
          {skill.proficiency}
        </span>
      </div>
      <div
        aria-hidden="true"
        className="h-1 w-full overflow-hidden rounded-full bg-bg-tertiary"
      >
        <div
          data-proficiency
          className="h-full rounded-full bg-accent"
          style={{ width: `${skill.proficiency}%` }}
        />
      </div>
    </li>
  );
}

export function SkillsSection() {
  const { t } = useTranslation();
  const { data } = usePublicSkills();

  const groups = useMemo(() => groupSkillsByCategory(data ?? []), [data]);

  if (groups.length === 0) return null;

  return (
    <div className="mt-12 animate-fade-in-up delay-500">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.about.skills}</h2>
        <p className="text-text-secondary max-w-2xl mx-auto text-lg">
          {t.about.marquee}
        </p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.category}
            className="mb-6 break-inside-avoid rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl p-6"
          >
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-accent">
              {t.skills.categories[group.category]}
            </h3>
            <ul className="space-y-4">
              {group.skills.map((item) => (
                <SkillRow key={item.id} skill={item} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
