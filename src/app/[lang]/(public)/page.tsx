import { HomePageContent } from "./home-content";
import { HeroSection } from "@/components/sections/hero";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { getMessages } from "@/lib/translations";
import { localizeCertificate } from "@/lib/localized-content";
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
      where: { isPublished: true, ...notDeleted },
      orderBy: { order: "asc" },
      take: 6,
    }),
  ["home-certificates"],
  { revalidate: 60, tags: ["certificates"] }
);

const getCounts = unstable_cache(
  async () => {
    const [projects, certificates, experience, skills] = await Promise.all([
      prisma.project.count({ where: { isPublished: true, ...notDeleted } }),
      prisma.certificate.count({ where: { isPublished: true, ...notDeleted } }),
      prisma.experience.count({ where: { isPublished: true, ...notDeleted } }),
      prisma.skill.count({ where: notDeleted }),
    ]);
    return { projects, certificates, experience, skills };
  },
  ["home-counts"],
  { revalidate: 60, tags: ["projects", "certificates"] }
);

const getProjects = unstable_cache(
  async () =>
    prisma.project.findMany({
      where: { isPublished: true, ...notDeleted },
      orderBy: { order: "asc" },
      take: 6,
    }),
  ["home-projects"],
  { revalidate: 60, tags: ["projects"] }
);

// Above the fold, so skills are fetched server-side like every other home-page
// datum. Do NOT move this to `usePublicSkills`: the home page renders inside
// `PublicProviders` (no QueryClientProvider) to keep react-query off the
// critical path. See public-providers.tsx.
const getSkills = unstable_cache(
  async () =>
    prisma.skill.findMany({
      where: notDeleted,
      orderBy: [{ category: "asc" }, { order: "asc" }],
      select: { id: true, name: true, iconName: true },
    }),
  ["home-skills"],
  { revalidate: 3600, tags: ["skills"] }
);

export default async function Home({ params }: HomePageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const validLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const messages = await getMessages(validLocale);
  const monthYear = new Intl.DateTimeFormat(validLocale, { month: "short", year: "numeric" });
  const [certificates, projects, counts, skills] = await Promise.all([
    getCertificates(),
    getProjects(),
    getCounts(),
    getSkills(),
  ]);

  return (
    <HomePageContent
      counts={counts}
      projects={projects.map((p) => mapDbProjectToProject(p, validLocale))}
      certificates={certificates.map((c) => {
        const localized = localizeCertificate(c, validLocale);

        return {
          id: Number(c.id),
          slug: c.slug,
          title: localized.title,
          issuer: c.issuer,
          credentialId: c.credentialId ?? undefined,
          issueDate: new Date(c.issueDate).toISOString(),
          period: (() => { const issued = `${messages.certificates.issuedOn} ${monthYear.format(new Date(c.issueDate))}`; if (!c.expiryDate) return issued; return `${issued} · ${messages.certificates.expiresOn} ${monthYear.format(new Date(c.expiryDate))}`; })(),
          thumbnail: c.thumbnail ?? "",
          gallery: c.gallery,
          skills: c.skills,
          summary: localized.summary,
        };
      })}
    >
      <HeroSection locale={validLocale} skills={skills} />
    </HomePageContent>
  );
}
