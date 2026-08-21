// page.test.ts
// Unit test generateStaticParams pada /certificates/[slug]: harus hermetik —
// mengembalikan [] saat database offline agar `next build` tidak crash.
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    certificate: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { generateStaticParams } from "./page";

describe("generateStaticParams (/certificates/[slug])", () => {
  it("returns [] when the database is unreachable", async () => {
    vi.mocked(prisma.certificate.findMany).mockRejectedValue(
      new Error("P1001: Can't reach database server"),
    );

    await expect(generateStaticParams()).resolves.toEqual([]);
  });

  it("maps published certificate slugs on success", async () => {
    vi.mocked(prisma.certificate.findMany).mockResolvedValue([
      { slug: "cert-a" },
      { slug: "cert-b" },
    ] as Awaited<ReturnType<typeof prisma.certificate.findMany>>);

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: "cert-a" },
      { slug: "cert-b" },
    ]);
  });
});
