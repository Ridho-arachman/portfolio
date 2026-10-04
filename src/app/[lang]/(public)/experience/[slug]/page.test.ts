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

vi.mock("@/lib/translations", async () => {
  const { default: enMessages } = await import("@/messages/en.json");
  return { getMessages: async () => enMessages };
});

vi.mock("./experience-detail-content", () => ({
  ExperienceDetailPageContent: () => null,
}));

import prisma from "@/lib/prisma";
import ExperienceDetailPage, { generateStaticParams } from "./page";

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

  // Draft tidak boleh ikut terdaftar sebagai params: kalau tidak, `next build`
  // akan mem-pre-render halaman draft dan membiarkan URL-nya terindeks.
  it("meminta hanya experience yang published dan belum di-trash", async () => {
    vi.mocked(prisma.experience.findMany).mockResolvedValue([]);

    await generateStaticParams();

    expect(prisma.experience.findMany).toHaveBeenCalledWith({
      where: { isPublished: true, deletedAt: null },
      select: { slug: true },
    });
  });
});

function experienceRow(certificates: unknown[] = []) {
  return {
    id: "e1",
    slug: "exp-a",
    title: "Frontend Developer Intern",
    company: "PT Tech Startup",
    location: "Jakarta, Indonesia",
    type: "INTERNSHIP",
    startDate: new Date("2024-01-01T00:00:00Z"),
    endDate: null,
    isCurrent: true,
    description: [],
    gallery: [],
    thumbnail: null,
    translations: null,
    projects: [],
    certificates,
  };
}

async function renderPage(lang = "en") {
  vi.mocked(prisma.experience.findMany).mockResolvedValue(
    [] as unknown as Awaited<ReturnType<typeof prisma.experience.findMany>>,
  );
  return ExperienceDetailPage({ params: Promise.resolve({ lang, slug: "exp-a" }) });
}

describe("related content (/experience/[slug])", () => {
  it("loads both relations through the existing findFirst, filtered like the primary row", async () => {
    vi.mocked(prisma.experience.findFirst).mockResolvedValue(
      experienceRow() as unknown as Awaited<ReturnType<typeof prisma.experience.findFirst>>,
    );

    await renderPage();

    // Guard relasi wajib `isPublished` + `notDeleted`, sama seperti entitas utama.
    expect(prisma.experience.findFirst).toHaveBeenCalledWith({
      where: { slug: "exp-a", isPublished: true, deletedAt: null },
      include: {
        projects: {
          where: { isPublished: true, deletedAt: null },
          orderBy: { order: "asc" },
        },
        certificates: {
          where: { isPublished: true, deletedAt: null },
          orderBy: { order: "asc" },
        },
      },
    });
  });

  it("passes empty relation arrays through so the sections collapse", async () => {
    vi.mocked(prisma.experience.findFirst).mockResolvedValue(
      experienceRow() as unknown as Awaited<ReturnType<typeof prisma.experience.findFirst>>,
    );

    const element = await renderPage();

    expect(element.props).toMatchObject({
      relatedProjects: [],
      relatedCertificates: [],
    });
  });

  it("resolves the locale override of a related certificate", async () => {
    vi.mocked(prisma.experience.findFirst).mockResolvedValue(
      experienceRow([
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
      ]) as unknown as Awaited<ReturnType<typeof prisma.experience.findFirst>>,
    );

    const element = await renderPage("id");

    expect(element.props.relatedCertificates).toEqual([
      expect.objectContaining({ slug: "aws-cp", title: "AWS 云从业者认证" }),
    ]);
  });
});