"use client";

import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ADMIN_SKILLS } from "./constants";
import { useAdminSkills, useDeleteSkill } from "@/hooks/use-skills";
import { usePagination } from "@/hooks/use-pagination";
import { Pagination } from "@/components/ui/pagination";
import type { AdminSkill } from "./constants";
import { resolveIcon } from "@/lib/icon-resolver";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const CATEGORY_LABELS: Record<AdminSkill["category"], string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DATABASE: "Database",
  DEVOPS_TOOLS: "DevOps & Tools",
  SOFT_SKILL: "Soft Skill",
};

export function SkillsList() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { page, search, setSearch, goToPage, paginationParams } =
    usePagination({ defaultPageSize: 10 });

  const { data, isLoading, isError } = useAdminSkills(paginationParams);
  const deleteMutation = useDeleteSkill();

  // Server sudah mengurutkan [{order asc}, {createdAt desc}].
  const skills = (data?.data ?? []) as AdminSkill[];
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ADMIN_SKILLS.title}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_SKILLS.subtitle}
              </p>
            </div>
          </div>

          <Link
            href="/admin/skills/new"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-bg-primary transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
          >
            <Plus className="h-3.5 w-3.5" />
            {ADMIN_SKILLS.addLabel}
          </Link>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
          <div className="border-b border-glass-border p-4 sm:p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={ADMIN_SKILLS.searchPlaceholder}
                className="w-full rounded-xl border border-glass-border bg-bg-primary/60 py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent/50"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 p-4 sm:p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{ADMIN_SKILLS.errorTitle}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {ADMIN_SKILLS.errorNote}
              </p>
            </div>
          ) : skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{ADMIN_SKILLS.emptyTitle}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {ADMIN_SKILLS.emptyNote}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-glass-border/60">
              {skills.map((skill) => (
                <li key={skill.id}>
                  <div className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/5 sm:px-5">
                    {skill.iconName ? (
                      (() => {
                        const ResolvedIcon = resolveIcon(skill.iconName);
                        return ResolvedIcon ? (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-glass-border bg-bg-primary/60 p-1.5">
                            <ResolvedIcon
                              size={28}
                              aria-hidden="true"
                              className="text-text-secondary"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-glass-border bg-accent/10 text-xs font-bold text-accent">
                            {getInitials(skill.name)}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-glass-border bg-accent/10 text-xs font-bold text-accent">
                        {getInitials(skill.name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {skill.name}
                        </p>
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            "bg-accent-muted text-accent",
                          )}
                        >
                          {CATEGORY_LABELS[skill.category] ?? skill.category}
                        </span>
                      </div>
                      <p className="truncate font-mono text-xs text-text-muted">
                        #{skill.order} · {skill.proficiency}/100
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/admin/skills/${skill.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        <Pencil className="h-3 w-3" />
                        {ADMIN_SKILLS.editLabel}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(skill.id)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-destructive/50 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        {ADMIN_SKILLS.deleteLabel}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="border-t border-glass-border p-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </section>
      </main>

      <ConfirmActionDialog
        open={deleteId !== null}
        title={ADMIN_SKILLS.deleteConfirmTitle}
        description={ADMIN_SKILLS.deleteConfirmDescription}
        confirmLabel={ADMIN_SKILLS.deleteConfirmLabel}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
