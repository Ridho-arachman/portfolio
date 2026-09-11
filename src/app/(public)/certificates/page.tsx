import { CertificatesPageContent } from "./certificates-content";
import { mapCertificateToData } from "@/components/sections/certificates/constants";
import prisma from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Certificates",
  description:
    "Daftar lengkap sertifikasi profesional dan kredensial yang saya miliki.",
  path: "/certificates",
});

export const dynamic = "force-dynamic";

export default async function CertificatesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const PAGE_SIZE = 6;

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.certificate.count({ where: { isPublished: true } }),
  ]);

  const data = certificates.map(mapCertificateToData);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return <CertificatesPageContent data={data} page={page} totalPages={totalPages} />;
}
