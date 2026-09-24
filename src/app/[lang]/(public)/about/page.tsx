import { AboutPageContent } from "./about-content";
import prisma from "@/lib/prisma";
import { mapExperiences } from "@/lib/utils/experience-mapper";
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
  async () => prisma.experience.findMany({ orderBy: { order: "asc" } }),
  ["about-experiences"],
  { revalidate: 3600, tags: ["experiences"] },
);

export default async function AboutPage() {
  const rawExperiences = await getExperiences();
  const experiences = mapExperiences(rawExperiences);

  return <AboutPageContent experiences={experiences} />;
}
