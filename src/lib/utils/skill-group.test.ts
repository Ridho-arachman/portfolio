import { describe, expect, it } from "vitest";

import { groupSkillsByCategory } from "./skill-group";

const SKILLS = [
  { name: "PostgreSQL", category: "DATABASE", order: 1 },
  { name: "React", category: "FRONTEND", order: 2 },
  { name: "Next.js", category: "FRONTEND", order: 1 },
  { name: "Communication", category: "SOFT_SKILL", order: 1 },
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

  it("keeps every field of the original skill by passing the object through", () => {
    const react = groupSkillsByCategory(SKILLS)[0].skills[1];

    expect(react).toBe(SKILLS[1]);
    expect(react.order).toBe(2);
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
