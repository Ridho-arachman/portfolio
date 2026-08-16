import { beforeEach, describe, expect, it } from "vitest";
import { useProjectStore } from "./project-store";
import { SEED_PROJECTS } from "./constants";

const newProject = {
  slug: "test-project",
  title: "Test Project",
  description: "A project created during a unit test.",
  thumbnail: "https://images.example.com/cover.jpg",
  technologies: ["Next.js", "Prisma"],
  isPublished: true,
  order: 99,
};

describe("project store", () => {
  beforeEach(() => {
    localStorage.clear();
    useProjectStore.setState({ projects: SEED_PROJECTS });
  });

  it("seeds projects from constants", () => {
    expect(useProjectStore.getState().projects).toHaveLength(
      SEED_PROJECTS.length,
    );
  });

  it("adds a project with generated id and timestamps", () => {
    useProjectStore.getState().addProject(newProject);

    const added = useProjectStore
      .getState()
      .projects.find((p) => p.title === newProject.title);
    expect(added).toBeDefined();
    expect(added?.id).toBeTruthy();
    expect(added?.createdAt).toBeTruthy();
    expect(added?.updatedAt).toBeTruthy();
    expect(useProjectStore.getState().projects).toHaveLength(
      SEED_PROJECTS.length + 1,
    );
  });

  it("updates an existing project and bumps updatedAt", () => {
    const id = useProjectStore.getState().projects[0].id;
    useProjectStore.getState().updateProject(id, {
      ...newProject,
      title: "Updated Title",
    });

    const updated = useProjectStore
      .getState()
      .projects.find((p) => p.id === id);
    expect(updated?.title).toBe("Updated Title");
  });

  it("leaves other projects untouched when updating", () => {
    const first = useProjectStore.getState().projects[0];
    const second = useProjectStore.getState().projects[1];
    useProjectStore.getState().updateProject(first.id, {
      ...newProject,
      title: "Changed",
    });

    expect(useProjectStore.getState().projects).toHaveLength(
      SEED_PROJECTS.length,
    );
    expect(
      useProjectStore.getState().projects.find((p) => p.id === second.id)?.title,
    ).toBe(second.title);
  });

  it("deletes a project by id", () => {
    const id = useProjectStore.getState().projects[0].id;
    useProjectStore.getState().deleteProject(id);

    expect(
      useProjectStore.getState().projects.find((p) => p.id === id),
    ).toBeUndefined();
  });

  it("resets to the seed list", () => {
    useProjectStore.getState().addProject(newProject);
    useProjectStore.getState().reset();

    expect(useProjectStore.getState().projects).toHaveLength(
      SEED_PROJECTS.length,
    );
    expect(useProjectStore.getState().projects[0].title).toBe(
      SEED_PROJECTS[0].title,
    );
  });
});
