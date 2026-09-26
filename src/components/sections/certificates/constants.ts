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



export interface CertificatePeriodLabels {
  issued: string;
  expires: string;
}

export type DateLike = Date | string;

type ToDateLike<T> = T extends Date
  ? DateLike
  : T extends null
    ? null
    : T;

/**
 * unstable_cache persists results as JSON, so a cache hit returns every Date
 * column as an ISO string even though Prisma types them as Date. Both forms are
 * valid, so anything crossing that boundary must be mapped through this type.
 */
export type Cached<T> = { [K in keyof T]: ToDateLike<T[K]> };

export function formatMonthYear(date: DateLike, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
    new Date(date),
  );
}

function formatPeriod(
  issueDate: DateLike,
  expiryDate: DateLike | null,
  locale: Locale,
  labels: CertificatePeriodLabels,
): string {
  const issued = `${labels.issued} ${formatMonthYear(issueDate, locale)}`;
  if (!expiryDate) return issued;
  return `${issued} · ${labels.expires} ${formatMonthYear(expiryDate, locale)}`;
}

export function mapCertificateToData(
  cert: Cached<Certificate>,
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
