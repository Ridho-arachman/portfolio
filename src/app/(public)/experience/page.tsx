import prisma from "@/lib/prisma";
import { mapExperiences } from "@/lib/utils/experience-mapper";
import { ExperienceListItem } from "@/components/sections/experience-list/experience-list-item";
import { PageHero } from "@/components/sections/page-hero";
import { Metadata } from "next";
import { ServerPagination } from "@/components/ui/server-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase } from "lucide-react";

const PAGE_SIZE = 6;

export const metadata: Metadata = {
  title: "All Experiences | Ridho.dev",
  description:
    "Daftar lengkap pengalaman profesional, peran kepemimpinan, dan pencapaian saya.",
};

export default async function ExperienceListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [rawExperiences, total] = await Promise.all([
    prisma.experience.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.experience.count({ where: { isPublished: true } }),
  ]);

  const experiences = mapExperiences(rawExperiences);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero bergaya About */}
      <PageHero
        badge="My Journey"
        title="All"
        titleAccent="Experiences"
        description="A comprehensive look at my professional journey, leadership roles, and the impact I've made."
        iconSet="experience"
      />

      {/* Grid List */}
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
  );
}
