import { ProjectCard } from "@/components/sections/projects/project-card";
import { PageHero } from "@/components/sections/page-hero";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { ServerPagination } from "@/components/ui/server-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";

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
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero bergaya About */}
      <PageHero
        badge="Selected Works"
        title="Featured"
        titleAccent="Projects"
        description="A glimpse into my recent work, showcasing scalable architecture and immersive user experiences."
        iconSet="projects"
      />

      {/* Grid List — konsisten dengan /experience dan /certificates */}
      <section className="container mx-auto px-4 max-w-5xl pb-20">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects available"
            description="Projects will appear here once published."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={mapDbProjectToProject(project)}
                index={index}
              />
            ))}
          </div>
        )}

        <div className="mt-12">
          <ServerPagination
            page={page}
            totalPages={totalPages}
            basePath="/projects"
          />
        </div>
      </section>
    </div>
  );
}