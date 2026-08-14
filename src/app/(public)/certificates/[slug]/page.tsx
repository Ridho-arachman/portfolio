"use client";

import { CertificateDetail } from "@/components/sections/certificate-detail";
import { CERTIFICATES_LIST } from "@/components/sections/certificates/constants";
import { getAdjacentCertificates } from "@/components/sections/certificate-detail/use-certificate-detail";
import { notFound } from "next/navigation";
import { use } from "react";

export default function CertificateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const cert = CERTIFICATES_LIST.find((c) => c.slug === slug);

  if (!cert) {
    notFound();
  }

  const { prev, next } = getAdjacentCertificates(CERTIFICATES_LIST, slug);

  return <CertificateDetail cert={cert} prev={prev} next={next} />;
}
