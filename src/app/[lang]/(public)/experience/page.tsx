import { ExperiencePageContent } from "./experience-content";
import prisma from "@/lib/prisma";
import { mapExperiences } from "@/lib/utils/experience-mapper";
import { getMessages } from "@/lib/translations";
import { Locale, isValidLocale, DEFAULT_LOCALE, getAlternatePaths } from "@/lib/i18n";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

interface ExperiencePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: ExperiencePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const messages = await getMessages(isValidLocale(locale) ? locale : DEFAULT_LOCALE);
  const alternates = getAlternatePaths('/experience');

  return {
    title: messages.experience.title,
    description: messages.experience.subtitle,
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
  async () => {
    return prisma.experience.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });
  },
  ["public-experiences"],
  { revalidate: 3600, tags: ["experiences"] },
);

export default async function ExperienceListPage({ params }: ExperiencePageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const validLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const rawExperiences = await getExperiences();
  const experiences = mapExperiences(rawExperiences);

  return <ExperiencePageContent experiences={experiences} />;
}
