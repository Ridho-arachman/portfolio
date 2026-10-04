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

vi.mock("@/lib/translations", async () => {
  const { default: enMessages } = await import("@/messages/en.json");
  return { getMessages: async () => enMessages };
});

vi.mock("./certificate-detail-content", () => ({
  CertificateDetailPageContent: () => null,
}));

import prisma from "@/lib/prisma";
import CertificateDetailPage, { generateStaticParams } from "./page";

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

function certificateRow(projects: unknown[] = []) {
  return {
    slug: "cert-a",
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    issueDate: new Date("2024-03-01T00:00:00Z"),
    expiryDate: null,
    thumbnail: null,
    gallery: [],
    skills: [],
    translations: null,
    projects,
    experiences: [],
  };
}

async function renderPage(lang = "en") {
  vi.mocked(prisma.certificate.findMany).mockResolvedValue(
    [] as unknown as Awaited<ReturnType<typeof prisma.certificate.findMany>>,
  );
  return CertificateDetailPage({ params: Promise.resolve({ lang, slug: "cert-a" }) });
}

describe("related content (/certificates/[slug])", () => {
  it("loads both relations through the existing findFirst, filtered like the primary row", async () => {
    vi.mocked(prisma.certificate.findFirst).mockResolvedValue(
      certificateRow() as unknown as Awaited<ReturnType<typeof prisma.certificate.findFirst>>,
    );

    await renderPage();

    // Guard relasi wajib `isPublished` + `notDeleted`: project atau experience
    // draft/trashed tidak boleh muncul sebagai "related" di halaman publik.
    expect(prisma.certificate.findFirst).toHaveBeenCalledWith({
      where: { slug: "cert-a", isPublished: true, deletedAt: null },
      include: {
        projects: {
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
    vi.mocked(prisma.certificate.findFirst).mockResolvedValue(
      certificateRow() as unknown as Awaited<ReturnType<typeof prisma.certificate.findFirst>>,
    );

    const element = await renderPage();

    expect(element.props).toMatchObject({
      relatedProjects: [],
      relatedExperiences: [],
    });
  });

  it("resolves the locale override of a related project", async () => {
    vi.mocked(prisma.certificate.findFirst).mockResolvedValue(
      certificateRow([
        {
          id: "p1",
          slug: "nextjs-portfolio",
          title: "Next.js Portfolio",
          description: "Base description",
          thumbnail: "",
          technologies: [],
          gallery: [],
          translations: { id: { title: "Portofolio Next.js" } },
        },
      ]) as unknown as Awaited<ReturnType<typeof prisma.certificate.findFirst>>,
    );

    const element = await renderPage("id");

    expect(element.props.relatedProjects).toEqual([
      expect.objectContaining({ slug: "nextjs-portfolio", title: "Portofolio Next.js" }),
    ]);
  });
});