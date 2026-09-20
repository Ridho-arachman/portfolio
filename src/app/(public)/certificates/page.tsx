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

const getCertificates = unstable_cache(
  async () => {
    return prisma.certificate.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });
  },
  ["public-certificates"],
  { revalidate: 3600, tags: ["certificates"] },
);

export default async function CertificatesListPage() {
  const certificates = await getCertificates();
  const data = certificates.map(mapCertificateToData);

  return <CertificatesPageContent data={data} />;
}
