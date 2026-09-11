import { CertificateDetailPageContent } from "./certificate-detail-content";
import { buildMetadata, buildNotFoundMetadata } from "@/lib/seo";
import { mapCertificateToData } from "@/components/sections/certificates/constants";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Helper functions defined FIRST to avoid hoisting issues
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
  list: { slug: string; title: string; issuer: string }[],
  slug: string,
): { prev: { slug: string; title: string; issuer: string } | null; next: { slug: string; title: string; issuer: string } | null } {
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
    return [];
  }
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<any> {
  const { slug } = await params;
  const cert = await getCertificate(slug);
  if (!cert) return { title: "Not Found" };
  return {
    title: cert.title,
    description: cert.summary.join(" ").slice(0, 155),
    openGraph: {
      images: cert.thumbnail ? [cert.thumbnail] : [],
    },
  };
}

export default async function CertificateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
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

  return <CertificateDetailPageContent cert={mapCertificateToData(cert)} prev={prev} next={next} />;
}
