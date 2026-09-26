import { describe, expect, it } from "vitest";

import { groupSkillsByCategory } from "./skill-group";

const SKILLS = [
  { name: "PostgreSQL", category: "DATABASE", proficiency: 80, order: 1 },
  { name: "React", category: "FRONTEND", proficiency: 90, order: 2 },
  { name: "Next.js", category: "FRONTEND", proficiency: 85, order: 1 },
  { name: "Communication", category: "SOFT_SKILL", proficiency: 75, order: 1 },
] as const;

describe("groupSkillsByCategory", () => {
  it("returns no groups when there are no skills", () => {
    expect(groupSkillsByCategory([])).toEqual([]);
  });

  it("follows the canonical category order instead of sorting by name", () => {
    const groups = groupSkillsByCategory(SKILLS);

    expect(groups.map((group) => group.category)).toEqual([
      "FRONTEND",
      "DATABASE",
      "SOFT_SKILL",
    ]);
  });

  it("sorts skills inside a group by order", () => {
    const frontend = groupSkillsByCategory(SKILLS)[0];

    expect(frontend.skills.map((skill) => skill.name)).toEqual([
      "Next.js",
      "React",
    ]);
  });

  it("leaves out categories that have no skills", () => {
    const groups = groupSkillsByCategory(SKILLS);

    expect(groups.map((group) => group.category)).not.toContain("BACKEND");
  });

  it("keeps every field of the original skill so the UI can read proficiency", () => {
    const react = groupSkillsByCategory(SKILLS)[0].skills[1];

    expect(react.proficiency).toBe(90);
  });

  it("does not mutate the input array", () => {
    const input = [...SKILLS];
    groupSkillsByCategory(input);

    expect(input.map((skill) => skill.name)).toEqual([
      "PostgreSQL",
      "React",
      "Next.js",
      "Communication",
    ]);
  });
});
