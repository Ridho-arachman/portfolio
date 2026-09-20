"use client";

import { Providers } from "@/lib/providers";
import { CertificateDetail } from "@/components/sections/certificate-detail";
import type { CertificateListData } from "@/components/sections/certificates/constants";

interface CertificateDetailPageContentProps {
  cert: CertificateListData;
  prev: CertificateListData | null;
  next: CertificateListData | null;
}

export function CertificateDetailPageContent({ cert, prev, next }: CertificateDetailPageContentProps) {
  return (
    <Providers>
      <CertificateDetail cert={cert} prev={prev} next={next} />
    </Providers>
  );
}
