import { ExperienceDetailPageContent } from "./experience-detail-content";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { mapExperiences, mapExperience } from "@/lib/utils/experience-mapper";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import { mapCertificateToData } from "@/components/sections/certificates/constants";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMessages } from "@/lib/translations";
import { localizeExperience } from "@/lib/localized-content";
import { isValidLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

interface ExperienceDetailPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  try {
    const experiences = await prisma.experience.findMany({
      where: { isPublished: true, ...notDeleted },
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
    where: { slug, isPublished: true, ...notDeleted },
    select: { title: true, company: true, translations: true },
  });

  if (!experience) {
    return { title: messages.experienceDetail.notFound };
  }

  const localized = localizeExperience(experience, locale);

  return {
    title: `${localized.title} — ${experience.company}`,
    description: messages.experienceDetail.metaDescription
      .replaceAll("{title}", localized.title)
      .replaceAll("{company}", experience.company),
  };
}

export const dynamic = 'force-dynamic';

export default async function ExperienceDetailPage({
  params,
}: ExperienceDetailPageProps) {
  const { slug, lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : DEFAULT_LOCALE;

  const rawExperience = await prisma.experience.findFirst({
    where: { slug, isPublished: true, ...notDeleted },
    // Guard di level query, bukan filter susulan: project/certificate draft atau
    // yang ada di trash tidak boleh muncul sebagai "related" di halaman publik.
    include: {
      projects: {
        where: { isPublished: true, ...notDeleted },
        orderBy: { order: "asc" },
      },
      certificates: {
        where: { isPublished: true, ...notDeleted },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!rawExperience) {
    notFound();
  }

  const messages = await getMessages(locale);
  const exp = mapExperience(
    rawExperience,
    locale,
    messages.experience.current,
  );

  const allRaw = await prisma.experience.findMany({
    where: { isPublished: true, ...notDeleted },
    orderBy: { order: "asc" },
  });
  const allMapped = mapExperiences(
    allRaw,
    locale,
    messages.experience.current,
  );

  const index = allMapped.findIndex((e) => e.slug === slug);
  const prev = index > 0 ? allMapped[index - 1] : null;
  const next = index < allMapped.length - 1 ? allMapped[index + 1] : null;

  const relatedProjects = rawExperience.projects.map((p) =>
    mapDbProjectToProject(p, locale),
  );
  const relatedCertificates = rawExperience.certificates.map((cert) =>
    mapCertificateToData(cert, locale, {
      issued: messages.certificates.issuedOn,
      expires: messages.certificates.expiresOn,
    }),
  );

  return (
    <ExperienceDetailPageContent
      exp={exp}
      prev={prev}
      next={next}
      relatedProjects={relatedProjects}
      relatedCertificates={relatedCertificates}
    />
  );
}
