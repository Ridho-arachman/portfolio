import { describe, expect, it } from "vitest";
import { SiGo, SiNginx, SiOpencode, SiPhp, SiReact } from "react-icons/si";
import { isKnownIconName, resolveIcon, resolveIconForSkill } from "./icon-resolver";

describe("resolveIcon", () => {
  it("resolves a canonical Simple Icons name", () => {
    expect(resolveIcon("SiReact")).toBe(SiReact);
  });

  it("resolves names missing from the curated map", () => {
    expect(resolveIcon("SiNginx")).toBe(SiNginx);
    expect(resolveIcon("SiOpencode")).toBe(SiOpencode);
    expect(resolveIcon("SiPhp")).toBe(SiPhp);
  });

  it("resolves aliases and loose spellings", () => {
    expect(resolveIcon("golang")).toBe(SiGo);
    expect(resolveIcon("Next.js")).toBeTruthy();
    expect(resolveIcon("node js")).toBeTruthy();
  });

  it("returns null for names that are not Simple Icons", () => {
    expect(resolveIcon("FaGolang")).toBeNull();
    expect(resolveIcon("TotallyMadeUp")).toBeNull();
  });
});

describe("isKnownIconName", () => {
  it("reports curated names as known", () => {
    expect(isKnownIconName("SiReact")).toBe(true);
    expect(isKnownIconName("SiNginx")).toBe(true);
    expect(isKnownIconName("SiPhp")).toBe(true);
  });

  it("reports unknown names as not known", () => {
    expect(isKnownIconName("FaGolang")).toBe(false);
  });
});

describe("resolveIconForSkill", () => {
  it("prefers the explicit iconName", () => {
    expect(resolveIconForSkill({ name: "Golang", iconName: "SiReact" })).toBe(SiReact);
  });

  it("falls back to the skill name when iconName misses or is absent", () => {
    expect(resolveIconForSkill({ name: "Golang", iconName: "FaGolang" })).toBe(SiGo);
    expect(resolveIconForSkill({ name: "Golang", iconName: null })).toBe(SiGo);
    expect(resolveIconForSkill({ name: "React" })).toBe(SiReact);
  });

  it("returns null when neither source resolves", () => {
    expect(resolveIconForSkill({ name: "Nonexistent Skill" })).toBeNull();
  });
});
