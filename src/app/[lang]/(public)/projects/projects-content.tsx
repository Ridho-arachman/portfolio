"use client";

import { useMemo, useState } from "react";
import { Providers } from "@/lib/providers";
import { ProjectCard } from "@/components/sections/projects/project-card";
import { PageHero } from "@/components/sections/page-hero";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { selectProjectPage } from "@/lib/utils/project-filter";

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
    categoryId: string | null;
    category: { id: string; name: string } | null;
  }[];
}

const FILTER_CHIP_BASE =
  "rounded-full border px-5 min-h-[48px] text-sm font-semibold transition-colors duration-300";

export function ProjectsPageContent({ projects }: ProjectsPageContentProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    for (const project of projects) {
      if (project.category && !seen.has(project.category.id)) {
        seen.set(project.category.id, project.category);
      }
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  const { visible, totalPages, page: currentPage } = useMemo(
    () => selectProjectPage(projects, categoryId, page, PAGE_SIZE),
    [projects, categoryId, page],
  );

  const selectCategory = (nextId: string | null) => {
    setCategoryId(nextId);
    setPage(1);
  };

  return (
    <Providers>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <PageHero
          badge={t.projects.badge}
          title={t.projects.title}
          description={t.projects.headerDesc}
          iconSet="projects"
        />

        <section className="container mx-auto px-4 max-w-5xl py-20 md:py-32">
          <h2 className="sr-only">{t.projects.title}</h2>
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title={t.projects.noProjects}
              description={t.projects.noProjectsDesc}
            />
          ) : (
            <>
              {categories.length > 0 && (
                <div
                  role="group"
                  aria-label={t.projects.filterLabel}
                  className="flex flex-wrap justify-center gap-3 mb-12"
                >
                  <button
                    type="button"
                    aria-pressed={categoryId === null}
                    onClick={() => selectCategory(null)}
                    className={`${FILTER_CHIP_BASE} ${
                      categoryId === null
                        ? "bg-accent text-bg-primary border-accent"
                        : "bg-glass-bg text-text-secondary border-glass-border hover:text-text-primary hover:border-accent/40"
                    }`}
                  >
                    {t.projects.filterAll}
                  </button>
                  {categories.map((category) => {
                    const isActive = categoryId === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => selectCategory(category.id)}
                        className={`${FILTER_CHIP_BASE} ${
                          isActive
                            ? "bg-accent text-bg-primary border-accent"
                            : "bg-glass-bg text-text-secondary border-glass-border hover:text-text-primary hover:border-accent/40"
                        }`}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {visible.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  title={t.projects.noProjects}
                  description={t.projects.noProjectsDesc}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                  {visible.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={mapDbProjectToProject(project)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {projects.length > 0 && totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </section>
      </div>
    </Providers>
  );
}
