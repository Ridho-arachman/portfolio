import { describe, expect, it } from "vitest";
import { experienceTypeLabel } from "./experience-type-label";
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";

describe("experienceTypeLabel", () => {
  it("maps the enum to the messages key of the active locale", () => {
    expect(experienceTypeLabel("WORK", enMessages.experience)).toBe("Full-time");
    expect(experienceTypeLabel("WORK", idMessages.experience)).toBe("Penuh Waktu");
    expect(experienceTypeLabel("INTERNSHIP", idMessages.experience)).toBe("Magang");
    expect(experienceTypeLabel("FREELANCE", enMessages.experience)).toBe("Freelance");
    expect(experienceTypeLabel("ORGANIZATION", enMessages.experience)).toBe(
      "Organization",
    );
  });

  it("falls back to the raw enum when no messages key exists", () => {
    expect(experienceTypeLabel("EDUCATION", enMessages.experience)).toBe("EDUCATION");
  });
});
