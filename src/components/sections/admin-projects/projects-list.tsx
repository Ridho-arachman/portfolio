"use client";

import {
  FolderKanban,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ADMIN_PROJECTS } from "./constants";
import { useProjectStore } from "./project-store";

export function ProjectsList() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const projects = useProjectStore((state) => state.projects);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const reset = useProjectStore((state) => state.reset);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? projects.filter(
          (project) =>
            project.title.toLowerCase().includes(q) ||
            project.slug.toLowerCase().includes(q) ||
            project.technologies.some((tag) => tag.toLowerCase().includes(q)),
        )
      : projects;

    return [...list].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [projects, query]);

  const handleDelete = (id: string) => {
    if (confirmId === id) {
      deleteProject(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  };

  const handleReset = () => {
    if (confirmReset) {
      reset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ADMIN_PROJECTS.title}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_PROJECTS.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3.5 py-2 text-xs transition-colors",
                confirmReset
                  ? "border-destructive/50 text-destructive"
                  : "text-text-secondary hover:border-accent/40 hover:text-accent",
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {confirmReset ? ADMIN_PROJECTS.resetConfirmLabel : ADMIN_PROJECTS.resetLabel}
            </button>

            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-bg-primary transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
            >
              <Plus className="h-3.5 w-3.5" />
              {ADMIN_PROJECTS.addLabel}
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
          <div className="border-b border-glass-border p-4 sm:p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={ADMIN_PROJECTS.searchPlaceholder}
                className="w-full rounded-xl border border-glass-border bg-bg-primary/60 py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent/50"
              />
            </div>
          </div>

          {!mounted ? (
            <div className="space-y-4 p-4 sm:p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                <FolderKanban className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{ADMIN_PROJECTS.emptyTitle}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {ADMIN_PROJECTS.emptyNote}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-glass-border/60">
              {filtered.map((project) => (
                <li key={project.id}>
                  <div className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/5 sm:px-5">
                    <Image
                      src={project.thumbnail}
                      alt={project.title}
                      width={320}
                      height={224}
                      unoptimized
                      className="hidden h-14 w-20 shrink-0 rounded-lg border border-glass-border object-cover sm:block"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {project.title}
                        </p>
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            project.isPublished
                              ? "bg-accent-muted text-accent"
                              : "bg-white/5 text-text-muted",
                          )}
                        >
                          {project.isPublished
                            ? ADMIN_PROJECTS.publishedLabel
                            : ADMIN_PROJECTS.draftLabel}
                        </span>
                      </div>
                      <p className="truncate font-mono text-xs text-text-muted">
                        /{project.slug}
                      </p>
                      {project.technologies.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-text-secondary"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-text-muted">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        <Pencil className="h-3 w-3" />
                        {ADMIN_PROJECTS.editLabel}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(project.id)}
                        onBlur={() => setConfirmId(null)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                          confirmId === project.id
                            ? "border-destructive/60 bg-destructive/15 text-destructive"
                            : "border-glass-border bg-glass-bg text-text-secondary hover:border-destructive/50 hover:text-destructive",
                        )}
                      >
                        <Trash2 className="h-3 w-3" />
                        {confirmId === project.id
                          ? ADMIN_PROJECTS.deleteConfirmLabel
                          : ADMIN_PROJECTS.deleteLabel}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-text-muted">
          {ADMIN_PROJECTS.mockNote}
        </p>
      </main>
    </div>
  );
}
