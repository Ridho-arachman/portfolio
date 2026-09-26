import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_LINKS,
  isNavActive,
} from "@/components/sections/admin-dashboard/constants";

describe("dashboard constants consistency", () => {
  it("admin nav has expected sections", () => {
    const labels = ADMIN_NAV_LINKS.map((link) => link.label);
    expect(labels).toEqual([
      "Dashboard",
      "Projects",
      "Categories",
      "Experience",
      "Certificates",
      "Skills",
      "Messages",
      "Trash",
      "Settings",
      "Translations",
    ]);
  });

  it("every nav link has a valid href", () => {
    for (const link of ADMIN_NAV_LINKS) {
      expect(link.href).toMatch(/^\/admin/);
      expect(link.icon).toBeDefined();
    }
  });
});

describe("isNavActive", () => {
  it("matches the section index exactly", () => {
    expect(isNavActive("/admin/projects", "/admin/projects")).toBe(true);
    expect(isNavActive("/admin/settings", "/admin/settings")).toBe(true);
  });

  it("stays active on create routes", () => {
    expect(isNavActive("/admin/projects/new", "/admin/projects")).toBe(true);
    expect(isNavActive("/admin/certificates/new", "/admin/certificates")).toBe(
      true,
    );
  });

  it("stays active on edit routes with an id", () => {
    expect(isNavActive("/admin/projects/abc123/edit", "/admin/projects")).toBe(
      true,
    );
    expect(isNavActive("/admin/experience/abc123/edit", "/admin/experience")).toBe(
      true,
    );
  });

  it("does not light up sibling sections", () => {
    expect(isNavActive("/admin/messages", "/admin/projects")).toBe(false);
    expect(isNavActive("/admin/skills/new", "/admin/categories")).toBe(false);
  });

  it("keeps the dashboard root from matching every admin page", () => {
    expect(isNavActive("/admin", "/admin")).toBe(true);
    expect(isNavActive("/admin/projects", "/admin")).toBe(false);
    expect(isNavActive("/admin/settings", "/admin")).toBe(false);
  });
});
