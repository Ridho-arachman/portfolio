import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_LINKS,
  DASHBOARD_STATS,
  RECENT_CERTIFICATES,
  RECENT_EXPERIENCE,
  RECENT_PROJECTS,
  TOTAL_VISITS,
  TOTAL_VISITS_FORMATTED,
  VISITS_OVERVIEW,
  VISITOR_LOCATIONS,
  VISITOR_REGIONS,
} from "@/components/sections/admin-dashboard/constants";
import { SEED_CERTIFICATES } from "@/components/sections/admin-certificates/constants";
import { SEED_EXPERIENCES } from "@/components/sections/admin-experience/constants";
import { SEED_PROJECTS } from "@/components/sections/admin-projects/constants";
import { SEED_MESSAGES } from "@/components/sections/admin-messages/constants";
import { SEED_SETTINGS } from "@/components/sections/admin-settings/constants";

describe("dashboard constants consistency", () => {
  it("visits overview has 30 daily points", () => {
    expect(VISITS_OVERVIEW).toHaveLength(30);
    for (const point of VISITS_OVERVIEW) {
      expect(point.visits).toBeGreaterThan(0);
    }
  });

  it("TOTAL_VISITS matches the sum of the overview", () => {
    const sum = VISITS_OVERVIEW.reduce((total, point) => total + point.visits, 0);
    expect(TOTAL_VISITS).toBe(sum);
    expect(TOTAL_VISITS_FORMATTED).toBe(sum.toLocaleString("en-US"));
  });

  it("all visitor locations are referenced by a region filter", () => {
    for (const location of VISITOR_LOCATIONS) {
      expect(VISITOR_REGIONS).toContain(location.region);
    }
  });

  it("every country has cities when visits > 0", () => {
    for (const location of VISITOR_LOCATIONS) {
      const citySum = location.cities.reduce(
        (total, city) => total + city.visits,
        0,
      );
      if (location.cities.length === 0) {
        expect(location.code).toBe("oth");
      } else {
        expect(citySum).toBeLessThanOrEqual(location.visits);
      }
    }
  });

  it("dashboard stats mirror seed list lengths", () => {
    const projectsStat = DASHBOARD_STATS.find((s) => s.label === "Total Projects");
    expect(projectsStat?.value).toBe(String(SEED_PROJECTS.length));

    const experienceStat = DASHBOARD_STATS.find((s) => s.label === "Experience");
    expect(experienceStat?.value).toBe(String(SEED_EXPERIENCES.length));

    const certsStat = DASHBOARD_STATS.find((s) => s.label === "Certificates");
    expect(certsStat?.value).toBe(String(SEED_CERTIFICATES.length));
  });

  it("recent lists reuse seeded data", () => {
    expect(RECENT_PROJECTS[0].title).toBe(SEED_PROJECTS[0].title);
    expect(RECENT_CERTIFICATES[0].title).toBe(SEED_CERTIFICATES[0].title);
    expect(RECENT_EXPERIENCE[0].title).toBe(SEED_EXPERIENCES[0].role);
  });

  it("admin nav has expected sections", () => {
    const labels = ADMIN_NAV_LINKS.map((link) => link.label);
    expect(labels).toEqual([
      "Dashboard",
      "Projects",
      "Experience",
      "Certificates",
      "Messages",
      "Settings",
    ]);
  });

  it("seed messages are all valid statuses", () => {
    for (const message of SEED_MESSAGES) {
      expect(["NEW", "READ", "REPLIED", "ARCHIVED"]).toContain(message.status);
    }
  });

  it("seed settings are complete", () => {
    expect(SEED_SETTINGS.profile.fullName.length).toBeGreaterThan(0);
    expect(SEED_SETTINGS.profile.email).toContain("@");
    expect(SEED_SETTINGS.site.siteName).toBe("Ridho.dev");
  });

  it("seed projects are published with unique slugs", () => {
    const slugs = SEED_PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(SEED_PROJECTS.every((p) => p.isPublished)).toBe(true);
  });
});
