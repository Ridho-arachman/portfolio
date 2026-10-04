import { CertificateDetailPageContent } from "./certificate-detail-content";
import {
  mapCertificateToData,
  type CertificateListData,
} from "@/components/sections/certificates/constants";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import { mapExperience } from "@/lib/utils/experience-mapper";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { getMessages } from "@/lib/translations";
import { localizeCertificate } from "@/lib/localized-content";
import { Locale, isValidLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Tanpa ini halaman bisa dilayani dari cache, sehingga certificate yang baru
// saja di-trash atau di-purge masih balas 200 di URL detailnya alih-alih 404.
export const dynamic = 'force-dynamic';

// Helper functions defined FIRST to avoid hoisting issues
async function getCertificate(slug: string) {
  return prisma.certificate.findFirst({
    where: { slug, isPublished: true, ...notDeleted },
    // Guard di level query, bukan filter susulan: project/experience draft atau
    // yang ada di trash tidak boleh muncul sebagai "related" di halaman publik.
    include: {
      projects: {
        where: { isPublished: true, ...notDeleted },
        orderBy: { order: "asc" },
      },
      experiences: {
        where: { isPublished: true, ...notDeleted },
        orderBy: { order: "asc" },
      },
    },
  });
}

async function getAllSlugs() {
  const certs = await prisma.certificate.findMany({
    where: { isPublished: true, ...notDeleted },
    orderBy: { order: "asc" },
    select: { slug: true },
  });
  return certs.map((c) => c.slug);
}

function getAdjacent(
  list: CertificateListData[],
  slug: string,
): { prev: CertificateListData | null; next: CertificateListData | null } {
  const index = list.findIndex((c) => c.slug === slug);
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const validLocale = isValidLocale(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const messages = await getMessages(validLocale);
  const cert = await getCertificate(slug);
  if (!cert) return { title: messages.certificateDetail.notFound };
  const localized = localizeCertificate(cert, validLocale);
  return {
    title: localized.title,
    description: localized.summary.join(" ").slice(0, 155),
    openGraph: {
      images: cert.thumbnail ? [cert.thumbnail] : [],
    },
  };
}

export default async function CertificateDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const validLocale = isValidLocale(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const messages = await getMessages(validLocale);
  const labels = { issued: messages.certificates.issuedOn, expires: messages.certificates.expiresOn };
  const cert = await getCertificate(slug);

  if (!cert) {
    notFound();
  }

  const allData = await prisma.certificate.findMany({
    where: { isPublished: true, ...notDeleted },
    orderBy: { order: "asc" },
  });
  const allMapped = allData.map((c) => mapCertificateToData(c, validLocale, labels));
  const { prev, next } = getAdjacent(allMapped, slug);

  const relatedProjects = cert.projects.map((p) => mapDbProjectToProject(p, validLocale));
  const relatedExperiences = cert.experiences.map((e) =>
    mapExperience(e, validLocale, messages.experience.current),
  );

  return (
    <CertificateDetailPageContent
      cert={mapCertificateToData(cert, validLocale, labels)}
      prev={prev}
      next={next}
      relatedProjects={relatedProjects}
      relatedExperiences={relatedExperiences}
    />
  );
}
