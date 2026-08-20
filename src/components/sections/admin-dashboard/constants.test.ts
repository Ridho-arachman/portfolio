import { describe, expect, it } from "vitest";
import { ADMIN_NAV_LINKS } from "@/components/sections/admin-dashboard/constants";

describe("dashboard constants consistency", () => {
  it("admin nav has expected sections", () => {
    const labels = ADMIN_NAV_LINKS.map((link) => link.label);
    expect(labels).toEqual([
      "Dashboard",
      "Projects",
      "Categories",
      "Experience",
      "Certificates",
      "Messages",
      "Settings",
    ]);
  });

  it("every nav link has a valid href", () => {
    for (const link of ADMIN_NAV_LINKS) {
      expect(link.href).toMatch(/^\/admin/);
      expect(link.icon).toBeDefined();
    }
  });
});
