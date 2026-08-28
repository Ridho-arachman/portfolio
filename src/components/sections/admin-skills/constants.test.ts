import { describe, expect, it } from "vitest";
import {
  SKILL_CATEGORY_VALUES,
  skillFormSchema,
} from "@/schema/skill";

const valid = {
  name: "Next.js",
  iconName: "SiNextdotjs",
  category: "FRONTEND",
  proficiency: 90,
  order: 1,
};

describe("skillFormSchema", () => {
  it("accepts a valid payload", () => {
    expect(skillFormSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an empty iconName", () => {
    expect(skillFormSchema.safeParse({ ...valid, iconName: "" }).success).toBe(
      true,
    );
  });

  it("accepts an omitted iconName", () => {
    const withoutIcon = {
      name: valid.name,
      category: valid.category,
      proficiency: valid.proficiency,
      order: valid.order,
    };
    expect(skillFormSchema.safeParse(withoutIcon).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(skillFormSchema.safeParse({ ...valid, name: "" }).success).toBe(
      false,
    );
  });

  it("accepts an arbitrary iconName string", () => {
    expect(
      skillFormSchema.safeParse({ ...valid, iconName: "anything" }).success,
    ).toBe(true);
  });

  it("accepts every defined category value", () => {
    for (const category of SKILL_CATEGORY_VALUES) {
      expect(skillFormSchema.safeParse({ ...valid, category }).success).toBe(
        true,
      );
    }
  });

  it("rejects a category outside the enum", () => {
    expect(
      skillFormSchema.safeParse({ ...valid, category: "BLOCKCHAIN" }).success,
    ).toBe(false);
  });

  it("coerces string numbers and rejects proficiency out of range", () => {
    expect(
      skillFormSchema.safeParse({ ...valid, proficiency: "85" }).success,
    ).toBe(true);
    expect(
      skillFormSchema.safeParse({ ...valid, proficiency: "0" }).success,
    ).toBe(false);
    expect(
      skillFormSchema.safeParse({ ...valid, proficiency: "101" }).success,
    ).toBe(false);
  });

  it("rejects a non-integer proficiency", () => {
    expect(
      skillFormSchema.safeParse({ ...valid, proficiency: 85.5 }).success,
    ).toBe(false);
  });

  it("rejects a negative order", () => {
    expect(skillFormSchema.safeParse({ ...valid, order: -1 }).success).toBe(
      false,
    );
  });
});
