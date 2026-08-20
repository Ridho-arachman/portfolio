import { ProjectsGrid } from "@/components/sections/projects";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { ServerPagination } from "@/components/ui/server-pagination";

const env = getEnv();

const PAGE_SIZE = 6;

export const metadata: Metadata = {
  title: `All Projects | ${env.NEXT_PUBLIC_SITE_NAME}`,
  description:
    "Proyek pilihan — portofolio web, dashboard SaaS, dan API yang scalable dengan arsitektur modern.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.project.count({ where: { isPublished: true } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="min-h-screen pt-32 bg-bg-primary">
      <ProjectsGrid projects={projects.map(mapDbProjectToProject)} />
      <div className="pb-20">
        <ServerPagination
          page={page}
          totalPages={totalPages}
          basePath="/projects"
        />
      </div>
    </main>
  );
}