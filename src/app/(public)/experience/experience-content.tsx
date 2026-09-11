"use client";

import { Providers } from "@/lib/providers";
import { ExperienceListItem } from "@/components/sections/experience-list/experience-list-item";
import { PageHero } from "@/components/sections/page-hero";
import { ServerPagination } from "@/components/ui/server-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase } from "lucide-react";
import type { MappedExperience } from "@/lib/utils/experience-mapper";

interface ExperiencePageContentProps {
  experiences: MappedExperience[];
  page: number;
  totalPages: number;
}

export function ExperiencePageContent({ experiences, page, totalPages }: ExperiencePageContentProps) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <PageHero
          badge="My Journey"
          title="All"
          titleAccent="Experiences"
          description="A comprehensive look at my professional journey, leadership roles, and the impact I've made."
          iconSet="experience"
        />

        <section className="container mx-auto px-4 max-w-5xl pb-20">
          {experiences.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No experiences yet"
              description="Experiences will appear here once published."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experiences.map((exp, index) => (
                <ExperienceListItem key={exp.id} exp={exp} index={index} />
              ))}
            </div>
          )}

          <div className="mt-12">
            <ServerPagination
              page={page}
              totalPages={totalPages}
              basePath="/experience"
            />
          </div>
        </section>
      </div>
    </Providers>
  );
}
