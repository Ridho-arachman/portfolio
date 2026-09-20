import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/projects",
    "/experience",
    "/certificates",
    "/contact",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  try {
    const [projects, experiences, certificates] = await Promise.all([
      prisma.project.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.experience.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.certificate.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      ...staticEntries,
      ...projects.map((p) => ({
        url: `${SITE_URL}/projects/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...experiences.map((e) => ({
        url: `${SITE_URL}/experience/${e.slug}`,
        lastModified: e.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...certificates.map((c) => ({
        url: `${SITE_URL}/certificates/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // Hermetic fallback: saat database tidak terjangkau (mis. CI build tanpa
    // DB), kembalikan rute statis saja alih-alih menggagalkan build.
    return staticEntries;
  }
}
