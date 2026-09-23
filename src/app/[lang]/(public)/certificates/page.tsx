import { CertificatesPageContent } from "./certificates-content";
import { mapCertificateToData } from "@/components/sections/certificates/constants";
import prisma from "@/lib/prisma";
import { getMessages } from "@/lib/translations";
import { Locale, isValidLocale, DEFAULT_LOCALE, getAlternatePaths } from "@/lib/i18n";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

interface CertificatesPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: CertificatesPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const messages = await getMessages(isValidLocale(locale) ? locale : DEFAULT_LOCALE);
  const alternates = getAlternatePaths('/certificates');

  return {
    title: messages.certificates.title,
    description: messages.certificates.subtitle,
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

const getCertificates = unstable_cache(
  async () => {
    return prisma.certificate.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });
  },
  ["public-certificates"],
  { revalidate: 3600, tags: ["certificates"] },
);

export default async function CertificatesListPage({ params }: CertificatesPageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const validLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const certificates = await getCertificates();
  const data = certificates.map(mapCertificateToData);

  return <CertificatesPageContent data={data} />;
}
