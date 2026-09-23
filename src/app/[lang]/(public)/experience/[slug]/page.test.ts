// page.test.ts
// Unit test generateStaticParams pada /experience/[slug]: harus hermetik —
// mengembalikan [] saat database offline agar `next build` tidak crash.
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    experience: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { generateStaticParams } from "./page";

describe("generateStaticParams (/experience/[slug])", () => {
  it("returns [] when the database is unreachable", async () => {
    vi.mocked(prisma.experience.findMany).mockRejectedValue(
      new Error("P1001: Can't reach database server"),
    );

    await expect(generateStaticParams()).resolves.toEqual([]);
  });

  it("maps experience slugs on success", async () => {
    vi.mocked(prisma.experience.findMany).mockResolvedValue([
      { slug: "exp-a" },
      { slug: "exp-b" },
    ] as Awaited<ReturnType<typeof prisma.experience.findMany>>);

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: "exp-a" },
      { slug: "exp-b" },
    ]);
  });
});
