"use client";

import { ArrowLeft, FolderKanban } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ADMIN_PROJECTS } from "./constants";
import { ProjectForm } from "./project-form";
import { useProjectStore } from "./project-store";

export function ProjectFormPage({
  mode,
  projectId,
}: {
  mode: "create" | "edit";
  projectId?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const projects = useProjectStore((state) => state.projects);
  const project = projectId
    ? projects.find((item) => item.id === projectId)
    : undefined;

  if (!mounted) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-glass-border bg-bg-primary/80 px-4 py-5 sm:px-8">
          <div className="h-8 w-52 animate-pulse rounded-lg bg-white/5" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-white/5" />
        </header>
        <main className="p-4 sm:p-8">
          <div className="h-80 animate-pulse rounded-2xl bg-white/5" />
        </main>
      </div>
    );
  }

  if (mode === "edit" && !project) {
    return (
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <FolderKanban className="h-6 w-6" />
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
    />
  );
}
