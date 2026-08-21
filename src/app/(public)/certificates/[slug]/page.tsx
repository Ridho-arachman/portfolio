import { CertificateDetail } from "@/components/sections/certificate-detail";
import {
  mapCertificateToData,
  type CertificateListData,
} from "@/components/sections/certificates/constants";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
    // Hermetic build fallback: saat database tidak terjangkau (mis. CI build
    // tanpa DB), lewahkan pra-render params dan biarkan halaman dirender
    // on-demand alih-alih menggagalkan `next build`.
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cert = await getCertificate(slug);
  if (!cert) return { title: "Certificate Not Found" };
  return {
    title: `${cert.title} | Ridho.dev`,
    description: cert.summary.join(" "),
  };
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cert = await getCertificate(slug);

  if (!cert) {
    notFound();
  }

  const allData = await prisma.certificate.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });
  const allMapped = allData.map(mapCertificateToData);
  const { prev, next } = getAdjacent(allMapped, slug);

  return <CertificateDetail cert={mapCertificateToData(cert)} prev={prev} next={next} />;
}
