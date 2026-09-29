"use client";

import { createElement, useMemo } from "react";
import { usePublicSkills } from "@/hooks/use-skills";
import { useTranslation } from "@/hooks/use-translation";
import { resolveIconForSkill } from "@/lib/icon-resolver";
import { groupSkillsByCategory } from "@/lib/utils/skill-group";
import type { AdminSkill } from "@/components/sections/admin-skills/constants";

function SkillChip({ skill }: { skill: AdminSkill }) {
  const icon = resolveIconForSkill(skill);

  return (
    <li className="flex items-center gap-2.5 rounded-xl border border-glass-border bg-bg-primary/50 px-3.5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent/40 hover:text-accent">
      {icon
        ? createElement(icon, {
            size: 18,
            "aria-hidden": true,
            className: "shrink-0 text-text-secondary",
          })
        : null}
      <span className="truncate">{skill.name}</span>
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
            <ul className="flex flex-wrap gap-2.5">
              {group.skills.map((item) => (
                <SkillChip key={item.id} skill={item} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
