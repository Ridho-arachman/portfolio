import { CertificatesPageContent } from "./certificates-content";
import { mapCertificateToData } from "@/components/sections/certificates/constants";
import prisma from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { unstable_cache } from "next/cache";

export const metadata = buildMetadata({
  title: "Certificates",
  description:
    "Daftar lengkap sertifikasi profesional dan kredensial yang saya miliki.",
  path: "/certificates",
});

export const revalidate = 3600;

const PAGE_SIZE = 6;

const getCertificatesPage = unstable_cache(
  async (page: number) => {
    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where: { isPublished: true },
        orderBy: { order: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.certificate.count({ where: { isPublished: true } }),
    ]);
    return { certificates, total };
  },
  ["public-certificates"],
  { revalidate: 3600, tags: ["certificates"] },
);

export default async function CertificatesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { certificates, total } = await getCertificatesPage(page);

  const data = certificates.map(mapCertificateToData);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return <CertificatesPageContent data={data} page={page} totalPages={totalPages} />;
}
