import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", null, undefined, false, "bar")).toBe("foo bar");
  });

  it("merges tailwind conflicting classes (later wins)", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("keeps non-conflicting classes together", () => {
    expect(cn("p-4", "text-sm", "font-bold")).toBe("p-4 text-sm font-bold");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn(null, undefined)).toBe("");
  });
});
