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

vi.mock("@/lib/translations", async () => {
  const { default: enMessages } = await import("@/messages/en.json");
  return { getMessages: async () => enMessages };
});

vi.mock("./project-detail-content", () => ({
  ProjectDetailPageContent: () => null,
}));

import prisma from "@/lib/prisma";
import ProjectDetailPage, { generateStaticParams } from "./page";

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

function projectRow(certificates: unknown[] = []) {
  return {
    id: "p1",
    slug: "alpha",
    title: "Alpha",
    description: "Base description",
    thumbnail: "",
    technologies: [],
    gallery: [],
    translations: null,
    certificates,
    experiences: [],
  };
}

async function renderPage(lang = "en") {
  vi.mocked(prisma.project.findMany).mockResolvedValue(
    [] as unknown as Awaited<ReturnType<typeof prisma.project.findMany>>,
  );
  return ProjectDetailPage({ params: Promise.resolve({ lang, slug: "alpha" }) });
}

describe("related content (/projects/[slug])", () => {
  it("loads both relations through the existing findFirst, filtered like the primary row", async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(
      projectRow() as unknown as Awaited<ReturnType<typeof prisma.project.findFirst>>,
    );

    await renderPage();

    // Guard relasi wajib `isPublished` + `notDeleted` seperti entitas utama.
    // Menhapusnya berarti project/certificate draft ikut terpilih di query —
    // menyaring setelah payload terbentuk sudah terlanjur terlambat.
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { slug: "alpha", isPublished: true, deletedAt: null },
      include: {
        certificates: {
          where: { isPublished: true, deletedAt: null },
          orderBy: { order: "asc" },
        },
        experiences: {
          where: { isPublished: true, deletedAt: null },
          orderBy: { order: "asc" },
        },
      },
    });
  });

  it("passes empty relation arrays through so the sections collapse", async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(
      projectRow() as unknown as Awaited<ReturnType<typeof prisma.project.findFirst>>,
    );

    const element = await renderPage();

    expect(element.props).toMatchObject({
      relatedCertificates: [],
      relatedExperiences: [],
    });
  });

  it("resolves the locale override of a related certificate", async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(
      projectRow([
        {
          slug: "aws-cp",
          title: "AWS Certified Cloud Practitioner",
          issuer: "Amazon Web Services",
          issueDate: new Date("2024-03-01T00:00:00Z"),
          expiryDate: null,
          thumbnail: null,
          gallery: [],
          skills: [],
          translations: { id: { title: "AWS 云从业者认证" } },
        },
      ]) as unknown as Awaited<ReturnType<typeof prisma.project.findFirst>>,
    );

    const element = await renderPage("id");

    expect(element.props.relatedCertificates).toEqual([
      expect.objectContaining({ slug: "aws-cp", title: "AWS 云从业者认证" }),
    ]);
  });
});