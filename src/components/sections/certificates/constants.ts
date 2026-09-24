import type { Certificate } from "@/generated/prisma/client";
import type { Locale } from "@/lib/i18n";

export interface CertificateListData {
  id: number;
  slug: string;
  title: string;
  issuer: string;
  credentialId?: string;
  credentialUrl?: string;
  issueDate: string;
  period: string;
  thumbnail: string;
  gallery: string[];
  skills: string[];
  summary: string[];
}

export interface CertificateCardProps {
  cert: CertificateListData;
  index?: number;
}

export type CertificatesBackgroundProps = Record<string, never>;

export const CERTIFICATES_VIEWPORT = {
  once: false,
  amount: 0.2,
  margin: "0px 0px -100px 0px",
} as const;

export interface CertificatePeriodLabels {
  issued: string;
  expires: string;
}

export function formatMonthYear(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(date);
}

function formatPeriod(
  issueDate: Date,
  expiryDate: Date | null,
  locale: Locale,
  labels: CertificatePeriodLabels,
): string {
  const issued = `${labels.issued} ${formatMonthYear(issueDate, locale)}`;
  if (!expiryDate) return issued;
  return `${issued} · ${labels.expires} ${formatMonthYear(expiryDate, locale)}`;
}

export function mapCertificateToData(
  cert: Certificate,
  locale: Locale,
  labels: CertificatePeriodLabels,
): CertificateListData {
  return {
    id: Number(cert.id) || 0,
    slug: cert.slug,
    title: cert.title,
    issuer: cert.issuer,
    credentialId: cert.credentialId ?? undefined,
    credentialUrl: cert.credentialUrl ?? undefined,
    issueDate: formatMonthYear(cert.issueDate, locale),
    period: formatPeriod(cert.issueDate, cert.expiryDate, locale, labels),
    thumbnail: cert.thumbnail ?? "",
    gallery: cert.gallery,
    skills: cert.skills,
    summary: cert.summary,
  };
}
