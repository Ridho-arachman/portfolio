import { HomePageContent } from "./home-content";
import { HeroSection } from "@/components/sections/hero";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import prisma from "@/lib/prisma";
import { getClientEnv } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";
import { unstable_cache } from "next/cache";

const env = getClientEnv();

export const metadata = buildMetadata({
  title: `${env.NEXT_PUBLIC_SITE_NAME} | ${env.NEXT_PUBLIC_SITE_TAGLINE}`,
  description: env.NEXT_PUBLIC_SITE_DESCRIPTION,
  path: "/",
  absolute: true,
});

export const revalidate = 60;

const getCertificates = unstable_cache(
  async () =>
    prisma.certificate.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
  ["home-certificates"],
  { revalidate: 60, tags: ["certificates"] }
);

const getProjects = unstable_cache(
  async () =>
    prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
  ["home-projects"],
  { revalidate: 60, tags: ["projects"] }
);

export default async function Home() {
  const [certificates, projects] = await Promise.all([
    getCertificates(),
    getProjects(),
  ]);

  return (
    <HomePageContent
      projects={projects.map(mapDbProjectToProject)}
      certificates={certificates.map((c) => ({
        id: Number(c.id),
        slug: c.slug,
        title: c.title,
        issuer: c.issuer,
        credentialId: c.credentialId ?? undefined,
        issueDate: c.issueDate.toISOString(),
        period: (() => { const d = new Date(c.issueDate); const issued = `Issued ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`; const expires = c.expiryDate ? ` · Expires ${new Date(c.expiryDate).toLocaleString("default", { month: "short" })} ${new Date(c.expiryDate).getFullYear()}` : " · No Expiration"; return issued + expires; })(),
        thumbnail: c.thumbnail ?? "",
        gallery: c.gallery,
        skills: c.skills,
        summary: c.summary,
      }))}
    >
      <HeroSection />
    </HomePageContent>
  );
}
