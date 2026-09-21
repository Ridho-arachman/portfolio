"use client";

import { useState } from "react";
import { Providers } from "@/lib/providers";
import { CertificateCard } from "@/components/sections/certificates/certificate-card";
import { PageHero } from "@/components/sections/page-hero";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Award } from "lucide-react";
import type { CertificateListData } from "@/components/sections/certificates/constants";

const PAGE_SIZE = 6;

interface CertificatesPageContentProps {
  data: CertificateListData[];
}

export function CertificatesPageContent({ data }: CertificatesPageContentProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const visibleData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

        <section className="container mx-auto px-4 max-w-5xl py-20 md:py-32">
          <h2 className="sr-only">Certificates</h2>
          {data.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No certificates yet"
              description="Certificates will appear here once published."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {visibleData.map((cert, index) => (
                <CertificateCard key={cert.id} cert={cert} index={index} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </section>
      </div>
    </Providers>
  );
}
