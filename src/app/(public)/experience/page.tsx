import prisma from "@/lib/prisma";
import { mapExperiences } from "@/lib/utils/experience-mapper";
import { ExperienceListItem } from "@/components/sections/experience-list/experience-list-item";
import { Metadata } from "next";
import { ServerPagination } from "@/components/ui/server-pagination";

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
    <main className="min-h-screen pt-32 pb-20 bg-bg-primary">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            All <span className="text-gradient-elegant">Experiences</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            A comprehensive look at my professional journey, leadership roles,
            and the impact I&apos;ve made.
          </p>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiences.map((exp, index) => (
            <ExperienceListItem key={exp.id} exp={exp} index={index} />
          ))}
        </div>

        <div className="mt-12">
          <ServerPagination
            page={page}
            totalPages={totalPages}
            basePath="/experience"
          />
        </div>
      </div>
    </main>
  );
}
