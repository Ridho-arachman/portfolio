import { describe, expect, it } from "vitest";
import {
  countryFeaturesByCode,
  worldCountries,
  worldCountryFeatures,
} from "@/lib/geo";

describe("geo world data", () => {
  it("loads world countries from the topojson", () => {
    expect(worldCountries.length).toBeGreaterThan(100);
    expect(worldCountryFeatures.length).toBe(worldCountries.length);
  });

  it("assigns ISO alpha-2 codes for mapped countries", () => {
    const indonesia = worldCountries.find((c) => c.name === "Indonesia");
    expect(indonesia?.code).toBe("id");

    const usa = worldCountries.find((c) => c.name === "United States of America");
    expect(usa?.code).toBe("us");
  });

  it("every country has a string id and a name", () => {
    for (const country of worldCountries) {
      expect(country.id).toBeTypeOf("string");
      expect(country.name.length).toBeGreaterThan(0);
    }
  });

  it("builds a lookup map keyed by code", () => {
    expect(countryFeaturesByCode.get("id")).toBeDefined();
    expect(countryFeaturesByCode.get("sg")).toBeDefined();

    for (const code of ["id", "us", "in", "sg", "my", "jp", "nl", "gb", "de", "au", "sa"]) {
      expect(countryFeaturesByCode.has(code)).toBe(true);
    }
  });

  it("map values point back into the feature collection", () => {
    const feature = countryFeaturesByCode.get("id");
    expect(worldCountryFeatures).toContain(feature);
  });
});
