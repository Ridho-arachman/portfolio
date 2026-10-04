import type { Certificate } from "@/generated/prisma/client";
import type { Locale } from "@/lib/i18n";
import { localizeCertificate } from "@/lib/localized-content";

/**
 * `slug` is the only identity here: it is `@unique` in Prisma, it is what the
 * URL is built from, and it is what the list renderers key on. There is
 * deliberately no numeric `id` — Prisma ids are cuids, so `Number(cuid)` is
 * always NaN and every row used to collapse onto the same React key.
 */
export interface CertificateListData {
  slug: string;
  title: string;
  issuer: string;
  credentialId?: string;
  credentialUrl?: string;
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
  // issueDate/expiryDate arrive as UTC midnight (admin sends a bare
  // `yyyy-MM-dd`, the API does `new Date(value)`), so without an explicit UTC
  // timezone any server behind UTC renders the previous month.
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
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
  const localized = localizeCertificate(cert, locale);

  return {
    slug: cert.slug,
    title: localized.title,
    issuer: cert.issuer,
    credentialId: cert.credentialId ?? undefined,
    credentialUrl: cert.credentialUrl ?? undefined,
    period: formatPeriod(cert.issueDate, cert.expiryDate, locale, labels),
    thumbnail: cert.thumbnail ?? "",
    gallery: cert.gallery,
    skills: cert.skills,
    summary: localized.summary,
  };
}
