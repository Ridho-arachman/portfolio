import { AboutSection } from "@/components/sections/about";
import { HeroSection } from "@/components/sections/hero";
import prisma from "@/lib/prisma";
import { getClientEnv } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";
import { Skeleton } from "@/components/ui/skeleton";
import HomeContent from "./home-content";

export const dynamic = "force-dynamic";

const env = getClientEnv();

export const metadata = buildMetadata({
  title: `${env.NEXT_PUBLIC_SITE_NAME} | ${env.NEXT_PUBLIC_SITE_TAGLINE}`,
  description: env.NEXT_PUBLIC_SITE_DESCRIPTION,
  path: "/",
  absolute: true,
});

export default async function Home() {
  const [certificates, projects] = await Promise.all([
    prisma.certificate.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
    prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
  ]);

  return (
    <HomeContent
      projects={projects.map((p) => ({
        id: Number(p.id),
        slug: p.slug,
        title: p.title,
        description: p.description,
        image: p.thumbnail,
        tags: p.technologies,
        gallery: p.gallery,
        link: `/projects/${p.slug}`,
      }))}
      certificates={certificates.map((c) => ({
        id: Number(c.id),
        slug: c.slug,
        title: c.title,
        issuer: c.issuer,
        credentialId: c.credentialId ?? undefined,
        issueDate: c.issueDate.toISOString(),
        period: (() => { const d = new Date(c.issueDate); return `Issued ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}` + (c.expiryDate ? ` · Expires ${new Date(c.expiryDate).toLocaleString("default", { month: "short" })} ${new Date(c.expiryDate).getFullYear()}` : " · No Expiration"); })(),
        thumbnail: c.thumbnail ?? "",
        gallery: c.gallery,
        skills: c.skills,
        summary: c.summary,
      }))}
    />
  );
}
