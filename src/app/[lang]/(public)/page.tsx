import { HomePageContent } from "./home-content";
import { HeroSection } from "@/components/sections/hero";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import prisma from "@/lib/prisma";
import { getMessages } from "@/lib/translations";
import { Locale, isValidLocale, DEFAULT_LOCALE, getAlternatePaths } from "@/lib/i18n";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const messages = await getMessages(isValidLocale(locale) ? locale : DEFAULT_LOCALE);
  const alternates = getAlternatePaths('/');

  return {
    title: messages.seo.defaultTitle,
    description: messages.seo.defaultDescription,
    keywords: messages.seo.keywords,
    alternates: {
      languages: alternates,
    },
    openGraph: {
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      alternateLocale: locale === 'id' ? 'en_US' : 'id_ID',
    },
  };
}

export const dynamic = 'force-dynamic';

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

export default async function Home({ params }: HomePageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const validLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
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
      <HeroSection locale={validLocale} />
    </HomePageContent>
  );
}
