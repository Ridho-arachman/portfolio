"use client";

import { Providers } from "@/lib/providers";
import { ProjectCard } from "@/components/sections/projects/project-card";
import { PageHero } from "@/components/sections/page-hero";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import { ServerPagination } from "@/components/ui/server-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";

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
  page: number;
  totalPages: number;
}

export function ProjectsPageContent({ projects, page, totalPages }: ProjectsPageContentProps) {
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

        <section className="container mx-auto px-4 max-w-5xl pb-20">
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects available"
              description="Projects will appear here once published."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
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
    </Providers>
  );
}
