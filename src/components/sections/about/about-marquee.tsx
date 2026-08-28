"use client";

import { useMemo } from "react";
import { TechMarquee } from "@/components/ui/tech-marquee";
import * as m from "motion/react-m";
import { marqueeVariants, REPLAY_VIEWPORT } from "./constants";
import { usePublicSkills } from "@/hooks/use-skills";

export function AboutMarquee() {
  // Data skill diambil dari BE via /api/public/skills (usePublicSkills).
  // Saat masih loading, gagal, atau kosong, TechMarquee otomatis memakai
  // daftar hardcoded bawaan sehingga section tidak pernah tampak rusak.
  const { data } = usePublicSkills();

  const items = useMemo(() => {
    // Hook mengembalikan unknown (fetchOne generik) — bentuk row Skill dari BE.
    const skills = (data ?? []) as Array<{
      name: string;
      iconName?: string | null;
    }>;
    return skills.map((skill) => ({
      name: skill.name,
      iconName: skill.iconName ?? null,
    }));
  }, [data]);

  return (
    <m.div
      variants={marqueeVariants}
      initial="hidden"
      whileInView="visible"
      viewport={REPLAY_VIEWPORT}
      className="mt-12"
    >
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-text-muted uppercase tracking-widest">
          Technologies I Work With
        </p>
      </div>
      <TechMarquee items={items} />
    </m.div>
  );
}
