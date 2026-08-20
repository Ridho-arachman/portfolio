import type { MotionValue } from "framer-motion";
import type { Certificate } from "@/generated/prisma/client";

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

export interface CertificatesBackgroundProps {
  bgY1: MotionValue<number>;
  bgY2: MotionValue<number>;
}

export const CERTIFICATES_VIEWPORT = {
  once: false,
  amount: 0.2,
  margin: "0px 0px -100px 0px",
} as const;

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatIssueDate(d: Date): string {
  return `${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function formatPeriod(issueDate: Date, expiryDate: Date | null): string {
  const issued = `Issued ${MONTH_SHORT[issueDate.getMonth()]} ${issueDate.getFullYear()}`;
  if (!expiryDate) return `${issued} · No Expiration`;
  return `${issued} · Expires ${MONTH_SHORT[expiryDate.getMonth()]} ${expiryDate.getFullYear()}`;
}

export function mapCertificateToData(cert: Certificate): CertificateListData {
  return {
    id: Number(cert.id) || 0,
    slug: cert.slug,
    title: cert.title,
    issuer: cert.issuer,
    credentialId: cert.credentialId ?? undefined,
    credentialUrl: cert.credentialUrl ?? undefined,
    issueDate: formatIssueDate(cert.issueDate),
    period: formatPeriod(cert.issueDate, cert.expiryDate),
    thumbnail: cert.thumbnail ?? "",
    gallery: cert.gallery,
    skills: cert.skills,
    summary: cert.summary,
  };
}
