import { ExperienceDetailPageContent } from "./experience-detail-content";
import prisma from "@/lib/prisma";
import { mapExperiences, mapExperience } from "@/lib/utils/experience-mapper";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMessages } from "@/lib/translations";
import { isValidLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

interface ExperienceDetailPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  try {
    const experiences = await prisma.experience.findMany({
      select: { slug: true },
    });
    return experiences.map((exp) => ({ slug: exp.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ExperienceDetailPageProps): Promise<Metadata> {
  const { slug, lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  const experience = await prisma.experience.findFirst({
    where: { slug },
    select: { title: true, company: true },
  });

  if (!experience) {
    return { title: messages.experienceDetail.notFound };
  }

  return {
    title: `${experience.title} — ${experience.company}`,
    description:
      locale === "id"
        ? `Detail pengalaman ${experience.title} di ${experience.company}.`
        : `Details of the ${experience.title} experience at ${experience.company}.`,
  };
}

export const dynamic = 'force-dynamic';

export default async function ExperienceDetailPage({
  params,
}: ExperienceDetailPageProps) {
  const { slug } = await params;

  const rawExperience = await prisma.experience.findFirst({
    where: { slug },
  });

  if (!rawExperience) {
    notFound();
  }

  const exp = mapExperience(rawExperience, 0);

  const allRaw = await prisma.experience.findMany({
    orderBy: { order: "asc" },
  });
  const allMapped = mapExperiences(allRaw);

  const index = allMapped.findIndex((e) => e.slug === slug);
  const prev = index > 0 ? allMapped[index - 1] : null;
  const next = index < allMapped.length - 1 ? allMapped[index + 1] : null;

  return <ExperienceDetailPageContent exp={exp} prev={prev} next={next} />;
}
