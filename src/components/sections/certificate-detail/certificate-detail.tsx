"use client";

import { useRef } from "react";
import type { CertificateListData } from "./constants";
import { CertificateDetailHero } from "./certificate-detail-hero";
import { CertificateDetailContent } from "./certificate-detail-content";
import { CertificateDetailNavigation } from "./certificate-detail-navigation";

interface CertificateDetailProps {
  cert: CertificateListData;
  prev: CertificateListData | null;
  next: CertificateListData | null;
}

export function CertificateDetail({ cert, prev, next }: CertificateDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-bg-primary">
      <CertificateDetailHero cert={cert} />

      <div className="container mx-auto px-4 max-w-5xl py-16 md:py-24">
        <CertificateDetailContent cert={cert} />

        <CertificateDetailNavigation prev={prev} next={next} />
      </div>
    </div>
  );
}