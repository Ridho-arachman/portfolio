import { beforeEach, describe, expect, it } from "vitest";
import { useExperienceStore } from "./experience-store";
import { SEED_EXPERIENCES } from "./constants";

const newExperience = {
  slug: "test-experience",
  role: "Test Role",
  company: "Test Company",
  type: "Work" as const,
  period: "Jan 2026 - Present",
  location: "Remote",
  thumbnail: "https://images.example.com/cover.jpg",
  gallery: [],
  description: ["A unit test achievement."],
  order: 0,
};

describe("experience store", () => {
  beforeEach(() => {
    localStorage.clear();
    useExperienceStore.setState({ experiences: SEED_EXPERIENCES });
  });

  it("seeds experiences from constants", () => {
    expect(useExperienceStore.getState().experiences).toHaveLength(
      SEED_EXPERIENCES.length,
    );
  });

  it("adds an experience", () => {
    useExperienceStore.getState().addExperience(newExperience);

    const added = useExperienceStore
      .getState()
      .experiences.find((e) => e.slug === newExperience.slug);
    expect(added).toBeDefined();
    expect(added?.id).toBeTruthy();
  });

  it("updates an experience", () => {
    const id = useExperienceStore.getState().experiences[0].id;
    useExperienceStore.getState().updateExperience(id, {
      ...newExperience,
      role: "Updated Role",
    });

    expect(
      useExperienceStore.getState().experiences.find((e) => e.id === id)?.role,
    ).toBe("Updated Role");
  });

  it("deletes an experience", () => {
    const id = useExperienceStore.getState().experiences[0].id;
    useExperienceStore.getState().deleteExperience(id);

    expect(
      useExperienceStore.getState().experiences.find((e) => e.id === id),
    ).toBeUndefined();
  });

  it("resets to the seed list", () => {
    useExperienceStore.getState().addExperience(newExperience);
    useExperienceStore.getState().reset();

    expect(useExperienceStore.getState().experiences).toHaveLength(
      SEED_EXPERIENCES.length,
    );
  });
});
