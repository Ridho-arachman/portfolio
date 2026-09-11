"use client";

import { Providers } from "@/lib/providers";
import { CertificateDetail } from "@/components/sections/certificate-detail";
import type { CertificateListData } from "@/components/sections/certificates/constants";

interface CertificateDetailPageContentProps {
  cert: {
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
  };
  prev: { slug: string; title: string; issuer: string } | null;
  next: { slug: string; title: string; issuer: string } | null;
}

export function CertificateDetailPageContent({ cert, prev, next }: CertificateDetailPageContentProps) {
  return (
    <Providers>
      <CertificateDetail cert={cert as CertificateListData} prev={prev as any} next={next as any} />
    </Providers>
  );
}
