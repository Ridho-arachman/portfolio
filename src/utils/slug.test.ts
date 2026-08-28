import { describe, expect, it } from "vitest";
import { slugify } from "@/utils/slug";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugify("My Project")).toBe("my-project");
  });

  it("collapses consecutive separators", () => {
    expect(slugify("Hello   World!! Test")).toBe("hello-world-test");
  });

  it("trims edge hyphens", () => {
    expect(slugify("--edge-case--")).toBe("edge-case");
  });

  it("keeps existing slugs untouched", () => {
    expect(slugify("web-dev-2024")).toBe("web-dev-2024");
  });

  it("returns an empty string for symbol-only input", () => {
    expect(slugify("*** ###")).toBe("");
  });
});
