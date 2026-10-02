import { describe, expect, it } from "vitest";

import type { Experience as PrismaExperience } from "@/generated/prisma/client";
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";
import {
  formatExperiencePeriod,
  mapExperience,
} from "@/lib/utils/experience-mapper";

function fixture(overrides: Partial<PrismaExperience> = {}): PrismaExperience {
  return {
    id: "exp-1",
    slug: "frontend-intern",
    title: "Frontend Intern",
    company: "Acme",
    thumbnail: null,
    type: "WORK",
    location: "Jakarta",
    startDate: new Date("2024-01-15T00:00:00Z"),
    endDate: null,
    isCurrent: true,
    description: ["Shipped landing page"],
    gallery: [],
    isPublished: true,
    order: 0,
    translations: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    deletedAt: null,
    ...overrides,
  };
}

describe("formatExperiencePeriod", () => {
  it("formats months with Intl for the requested locale", () => {
    expect(
      formatExperiencePeriod(
        "2024-01-15T00:00:00Z",
        "2024-08-15T00:00:00Z",
        false,
        "en",
        enMessages.experience.current,
      ),
    ).toBe("Jan 2024 - Aug 2024");
    expect(
      formatExperiencePeriod(
        "2024-01-15T00:00:00Z",
        "2024-08-15T00:00:00Z",
        false,
        "id",
        idMessages.experience.current,
      ),
    ).toBe("Jan 2024 - Agu 2024");
  });

  it("uses the translated present label instead of hardcoded English", () => {
    expect(
      formatExperiencePeriod(
        "2024-01-15T00:00:00Z",
        null,
        true,
        "id",
        idMessages.experience.current,
      ),
    ).toBe(`Jan 2024 - ${idMessages.experience.current}`);
    expect(idMessages.experience.current).toBe("Sekarang");
  });

  it("keeps the English defaults so old callers render unchanged", () => {
    expect(
      formatExperiencePeriod("2024-01-15T00:00:00Z", null, true),
    ).toBe("Jan 2024 - Present");
  });
});

describe("mapExperience", () => {
  it("threads locale and present label into the period", () => {
    const en = mapExperience(
      fixture(),
      "en",
      enMessages.experience.current,
    );
    const id = mapExperience(
      fixture(),
      "id",
      idMessages.experience.current,
    );

    expect(en.period).toBe("Jan 2024 - Present");
    expect(id.period).toBe("Jan 2024 - Sekarang");
  });
});
