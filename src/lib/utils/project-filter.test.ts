import { describe, expect, it } from "vitest";

import { selectProjectPage } from "./project-filter";

const PROJECTS = [
  { id: 1, categoryId: "web" },
  { id: 2, categoryId: "mobile" },
  { id: 3, categoryId: "web" },
  { id: 4, categoryId: "web" },
  { id: 5, categoryId: "mobile" },
];

describe("selectProjectPage", () => {
  it("returns every project when no category is selected", () => {
    const result = selectProjectPage(PROJECTS, null, 1, 2);

    expect(result.visible.map((p) => p.id)).toEqual([1, 2]);
    expect(result.totalPages).toBe(3);
  });

  it("returns only projects in the selected category", () => {
    const result = selectProjectPage(PROJECTS, "mobile", 1, 2);

    expect(result.visible.map((p) => p.id)).toEqual([2, 5]);
    expect(result.totalPages).toBe(1);
  });

  it("paginates after filtering, not before", () => {
    const result = selectProjectPage(PROJECTS, "web", 2, 2);

    expect(result.visible.map((p) => p.id)).toEqual([4]);
  });

  it("clamps the page when the filtered result has fewer pages", () => {
    const result = selectProjectPage(PROJECTS, "mobile", 3, 2);

    expect(result.page).toBe(1);
    expect(result.visible.map((p) => p.id)).toEqual([2, 5]);
  });

  it("keeps projects without a category out of every category filter", () => {
    const withUncategorised = [...PROJECTS, { id: 6, categoryId: null }];

    expect(
      selectProjectPage(withUncategorised, "web", 1, 10).visible.map((p) => p.id),
    ).not.toContain(6);
  });

  it("reports a single empty page when nothing matches", () => {
    const result = selectProjectPage(PROJECTS, "games", 1, 6);

    expect(result.visible).toEqual([]);
    expect(result.totalPages).toBe(1);
  });
});
