"use client";

import { useState } from "react";
import { Providers } from "@/lib/providers";
import { ExperienceListItem } from "@/components/sections/experience-list/experience-list-item";
import { PageHero } from "@/components/sections/page-hero";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase } from "lucide-react";
import type { MappedExperience } from "@/lib/utils/experience-mapper";
import { useTranslation } from "@/hooks/use-translation";

const PAGE_SIZE = 6;

interface ExperiencePageContentProps {
  experiences: MappedExperience[];
}

export function ExperiencePageContent({ experiences }: ExperiencePageContentProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(experiences.length / PAGE_SIZE);
  const visibleExperiences = experiences.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Providers>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <PageHero
          badge={t.experience.badge}
          title={t.experience.headerTitle}
          titleAccent={t.experience.headerAccent}
          description={t.experience.headerDesc}
          iconSet="experience"
        />

        <section className="container mx-auto px-4 max-w-5xl py-20 md:py-32">
          <h2 className="sr-only">{t.experience.headerAccent}</h2>
          {experiences.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t.experience.emptyTitle}
              description={t.experience.emptyDesc}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleExperiences.map((exp, index) => (
                <ExperienceListItem key={exp.id} exp={exp} index={index} />
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
