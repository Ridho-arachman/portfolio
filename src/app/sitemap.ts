import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

// Optimasi static TIDAK tersedia di sini: `force-static` membekukan URL saat
// build, jadi admin yang ganti domain di settings tidak akan pernah sampai ke
// sitemap.xml sampai redeploy. `getSiteSettings` sudah `unstable_cache`, jadi
// biayanya kecil (satu query per jam per tag).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl } = await getSiteSettings();
  const staticEntries: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/projects",
    "/experience",
    "/certificates",
    "/contact",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
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
        where: { isPublished: true },
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
        url: `${siteUrl}/projects/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...experiences.map((e) => ({
        url: `${siteUrl}/experience/${e.slug}`,
        lastModified: e.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...certificates.map((c) => ({
        url: `${siteUrl}/certificates/${c.slug}`,
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
