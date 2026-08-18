import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_LINKS,
  DASHBOARD_STATS,
  RECENT_CERTIFICATES,
  TOTAL_VISITS,
  TOTAL_VISITS_FORMATTED,
  VISITS_OVERVIEW,
  VISITOR_LOCATIONS,
  VISITOR_REGIONS,
} from "@/components/sections/admin-dashboard/constants";

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

  it("dashboard stats have expected structure", () => {
    const certsStat = DASHBOARD_STATS.find((s) => s.label === "Certificates");
    expect(certsStat?.value).toBe("5");
  });

  it("recent lists have expected structure", () => {
    expect(RECENT_CERTIFICATES).toHaveLength(4);
    expect(RECENT_CERTIFICATES[0]).toHaveProperty("title");
    expect(RECENT_CERTIFICATES[0]).toHaveProperty("subtitle");
    expect(RECENT_CERTIFICATES[0]).toHaveProperty("badge");
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
});
