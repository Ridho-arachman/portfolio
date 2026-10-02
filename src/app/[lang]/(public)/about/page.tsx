import { AboutPageContent } from "./about-content";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { mapExperiences } from "@/lib/utils/experience-mapper";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import { getMessages } from "@/lib/translations";
import { Locale, isValidLocale, DEFAULT_LOCALE, getAlternatePaths } from "@/lib/i18n";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

interface AboutPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const messages = await getMessages(isValidLocale(locale) ? locale : DEFAULT_LOCALE);
  const alternates = getAlternatePaths('/about');

  return {
    title: messages.about.title,
    description: messages.about.description,
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

export const revalidate = 3600;

const getExperiences = unstable_cache(
  async () =>
    prisma.experience.findMany({
      where: { isPublished: true, ...notDeleted },
      orderBy: { order: "asc" },
    }),
  ["about-experiences"],
  { revalidate: 3600, tags: ["experiences"] },
);

const getProjects = unstable_cache(
  async () =>
    prisma.project.findMany({
      where: { isPublished: true, ...notDeleted },
      orderBy: { order: "asc" },
      take: 4,
    }),
  ["about-projects"],
  { revalidate: 3600, tags: ["projects"] },
);

const getSkills = unstable_cache(
  async () =>
    prisma.skill.findMany({
      where: notDeleted,
      orderBy: { order: "asc" },
      select: { name: true },
    }),
  ["about-skills"],
  { revalidate: 3600, tags: ["skills"] },
);

// Stat latin Home: project/certificate/experience/skill. Nothing is stored --
// every figure on the page is counted from the rows that are actually published.
const getCounts = unstable_cache(
  async () =>
    Promise.all([
      prisma.project.count({ where: { isPublished: true, ...notDeleted } }),
      prisma.certificate.count({ where: { isPublished: true, ...notDeleted } }),
      prisma.experience.count({ where: { isPublished: true, ...notDeleted } }),
      prisma.skill.count({ where: notDeleted }),
    ]).then(([projects, certificates, experience, skills]) => ({
      projects,
      certificates,
      experience,
      skills,
    })),
  ["about-counts"],
  { revalidate: 60, tags: ["projects", "certificates", "skills"] },
);

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params;
  const locale = isValidLocale(lang) ? (lang as Locale) : DEFAULT_LOCALE;

  const [rawExperiences, rawProjects, rawSkills, counts, messages] =
    await Promise.all([
      getExperiences(),
      getProjects(),
      getSkills(),
      getCounts(),
      getMessages(locale),
    ]);

  return (
    <AboutPageContent
      experiences={mapExperiences(
        rawExperiences,
        locale,
        messages.experience.current,
      )}
      projects={rawProjects.map((project) => mapDbProjectToProject(project, locale))}
      skillNames={rawSkills.map((skill) => skill.name)}
      counts={counts}
    />
  );
}