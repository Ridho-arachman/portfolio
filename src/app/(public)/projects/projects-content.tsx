"use client";

import { useState } from "react";
import { Providers } from "@/lib/providers";
import { ProjectCard } from "@/components/sections/projects/project-card";
import { PageHero } from "@/components/sections/page-hero";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";

const PAGE_SIZE = 6;

interface ProjectsPageContentProps {
  projects: {
    id: string | number;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    technologies: string[];
    gallery: string[];
  }[];
}

export function ProjectsPageContent({ projects }: ProjectsPageContentProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(projects.length / PAGE_SIZE);
  const visibleProjects = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Providers>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <PageHero
          badge="Selected Works"
          title="Featured"
          titleAccent="Projects"
          description="A glimpse into my recent work, showcasing scalable architecture and immersive user experiences."
          iconSet="projects"
        />

        <section className="container mx-auto px-4 max-w-5xl py-20 md:py-32">
          <h2 className="sr-only">Projects</h2>
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects available"
              description="Projects will appear here once published."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {visibleProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={mapDbProjectToProject(project)}
                  index={index}
                />
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
