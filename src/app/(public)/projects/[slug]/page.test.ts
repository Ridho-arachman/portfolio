// page.test.ts
// Unit test generateStaticParams pada /projects/[slug]: harus hermetik —
// mengembalikan [] saat database offline agar `next build` tidak crash.
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    project: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { generateStaticParams } from "./page";

describe("generateStaticParams (/projects/[slug])", () => {
  it("returns [] when the database is unreachable", async () => {
    vi.mocked(prisma.project.findMany).mockRejectedValue(
      new Error("P1001: Can't reach database server"),
    );

    await expect(generateStaticParams()).resolves.toEqual([]);
  });

  it("maps published project slugs on success", async () => {
    vi.mocked(prisma.project.findMany).mockResolvedValue([
      { slug: "alpha" },
      { slug: "beta" },
    ] as Awaited<ReturnType<typeof prisma.project.findMany>>);

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: "alpha" },
      { slug: "beta" },
    ]);
  });
});
