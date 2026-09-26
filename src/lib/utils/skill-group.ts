import { SKILL_CATEGORY_VALUES, type SkillCategory } from "@/schema/skill";

export interface SkillGroup<T> {
  category: SkillCategory;
  skills: T[];
}

export function groupSkillsByCategory<
  T extends { category: SkillCategory; order: number },
>(skills: readonly T[]): SkillGroup<T>[] {
  const buckets = new Map<SkillCategory, T[]>();

  for (const skill of skills) {
    const bucket = buckets.get(skill.category);
    if (bucket) {
      bucket.push(skill);
    } else {
      buckets.set(skill.category, [skill]);
    }
  }

  return SKILL_CATEGORY_VALUES.flatMap((category) => {
    const bucket = buckets.get(category);
    if (!bucket) return [];
    return [{ category, skills: bucket.sort((a, b) => a.order - b.order) }];
  });
}
