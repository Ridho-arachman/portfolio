import { CertificateDetailPageContent } from "./certificate-detail-content";
import {
  mapCertificateToData,
  type CertificateListData,
} from "@/components/sections/certificates/constants";
import prisma from "@/lib/prisma";
import { getMessages } from "@/lib/translations";
import { Locale, isValidLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Helper functions defined FIRST to avoid hoisting issues
async function getCertificate(slug: string) {
  return prisma.certificate.findFirst({
    where: { slug, isPublished: true },
  });
}

async function getAllSlugs() {
  const certs = await prisma.certificate.findMany({
    where: { isPublished: true },
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
  return {
    title: cert.title,
    description: cert.summary.join(" ").slice(0, 155),
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
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });
  const allMapped = allData.map((c) => mapCertificateToData(c, validLocale, labels));
  const { prev, next } = getAdjacent(allMapped, slug);

  return <CertificateDetailPageContent cert={mapCertificateToData(cert, validLocale, labels)} prev={prev} next={next} />;
}
