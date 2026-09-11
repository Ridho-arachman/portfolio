"use client";

import { Providers } from "@/lib/providers";
import { CertificateCard } from "@/components/sections/certificates/certificate-card";
import { PageHero } from "@/components/sections/page-hero";
import { ServerPagination } from "@/components/ui/server-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Award } from "lucide-react";
import type { CertificateListData } from "@/components/sections/certificates/constants";

interface CertificatesPageContentProps {
  data: CertificateListData[];
  page: number;
  totalPages: number;
}

export function CertificatesPageContent({ data, page, totalPages }: CertificatesPageContentProps) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <PageHero
          badge="Credentials"
          title="My"
          titleAccent="Certificates"
          description="Professional certifications and credentials validating my expertise in cloud, front-end, data, and UX design."
          iconSet="certificates"
        />

        <section className="container mx-auto px-4 max-w-5xl pb-20">
          {data.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No certificates yet"
              description="Certificates will appear here once published."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
    </Providers>
  );
}
