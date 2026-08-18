"use client";

import { AlertCircle, ArrowLeft, FolderKanban, Loader2 } from "lucide-react";
import Link from "next/link";
import { ADMIN_PROJECTS } from "./constants";
import { ProjectForm } from "./project-form";
import { useAdminProject, useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import type { AdminProject } from "./constants";

export function ProjectFormPage({
  mode,
  projectId,
}: {
  mode: "create" | "edit";
  projectId?: string;
}) {
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const { data: projectData, isLoading, isError } = useAdminProject(
    mode === "edit" ? (projectId ?? "") : "",
  );

  const project = projectData as AdminProject | undefined;

  if (mode === "edit" && isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-glass-border bg-bg-primary/80 px-4 py-5 sm:px-8">
          <div className="h-8 w-52 animate-pulse rounded-lg bg-white/5" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-white/5" />
        </header>
        <main className="flex flex-1 items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </main>
      </div>
    );
  }

  if (mode === "edit" && (isError || !project)) {
    return (
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            {isError ? (
              <AlertCircle className="h-6 w-6 text-destructive" />
            ) : (
              <FolderKanban className="h-6 w-6" />
            )}
          </div>
          <h1 className="text-xl font-bold">{ADMIN_PROJECTS.notFoundTitle}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {ADMIN_PROJECTS.notFoundNote}
          </p>
          <Link
            href="/admin/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            {ADMIN_PROJECTS.backLabel}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <ProjectForm
      key={project?.id ?? "create"}
      mode={mode}
      initialData={project}
      isLoading={createMutation.isPending || updateMutation.isPending}
      onSubmit={
        mode === "edit" && project
          ? (data) =>
              updateMutation.mutate(
                { id: project.id, data },
                { onSuccess: () => {} },
              )
          : (data) => createMutation.mutate(data)
      }
    />
  );
}
