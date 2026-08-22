import { CertificateCard } from "@/components/sections/certificates/certificate-card";
import { mapCertificateToData } from "@/components/sections/certificates/constants";
import { PageHero } from "@/components/sections/page-hero";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { getEnv } from "@/lib/env";
import { ServerPagination } from "@/components/ui/server-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Award } from "lucide-react";

const env = getEnv();

const PAGE_SIZE = 6;

export const metadata: Metadata = {
  title: `All Certificates | ${env.NEXT_PUBLIC_SITE_NAME}`,
  description:
    "Daftar lengkap sertifikasi profesional dan kredensial yang saya miliki.",
};

export default async function CertificatesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

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

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero bergaya About */}
      <PageHero
        badge="Credentials"
        title="My"
        titleAccent="Certificates"
        description="Professional certifications and credentials validating my expertise in cloud, front-end, data, and UX design."
        iconSet="certificates"
      />

      {/* Grid List */}
      <section className="container mx-auto px-4 max-w-5xl pb-20">
        {data.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates yet"
            description="Certificates will appear here once published."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((cert, index) => (
              <CertificateCard key={cert.id} cert={cert} index={index} />
            ))}
          </div>
        )}

        <div className="mt-12">
          <ServerPagination
            page={page}
            totalPages={totalPages}
            basePath="/certificates"
          />
        </div>
      </section>
    </div>
  );
}