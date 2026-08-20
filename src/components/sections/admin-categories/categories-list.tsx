"use client";

import {
  AlertTriangle,
  FolderTree,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ADMIN_CATEGORIES } from "./constants";
import {
  useAdminCategories,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { usePagination } from "@/hooks/use-pagination";
import { Pagination } from "@/components/ui/pagination";
import type { AdminCategory } from "./constants";

export function CategoriesList() {
  const [mounted, setMounted] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { page, search, setSearch, goToPage, paginationParams } =
    usePagination({ defaultPageSize: 10 });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { data, isLoading, isError } = useAdminCategories(paginationParams);
  const deleteMutation = useDeleteCategory();

  const categories: AdminCategory[] =
    (data?.data as AdminCategory[]) ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const filtered = useMemo(() => {
    return [...categories].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [categories]);

  const handleDelete = (id: string) => {
    if (confirmId === id) {
      deleteMutation.mutate(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ADMIN_CATEGORIES.title}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_CATEGORIES.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-bg-primary transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
            >
              <Plus className="h-3.5 w-3.5" />
              {ADMIN_CATEGORIES.addLabel}
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={ADMIN_CATEGORIES.searchPlaceholder}
                className="w-full rounded-xl border border-glass-border bg-bg-primary/60 py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent/50"
              />
            </div>
          </div>

          {!mounted || isLoading ? (
            <div className="space-y-4 p-4 sm:p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Failed to load categories</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Please try again later.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                <FolderTree className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">
                {ADMIN_CATEGORIES.emptyTitle}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {ADMIN_CATEGORIES.emptyNote}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-glass-border/60">
              {filtered.map((category) => (
                <li key={category.id}>
                  <div className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/5 sm:px-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {category.name}
                        </p>
                        <span className="inline-flex shrink-0 items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                          {category.slug}
                        </span>
                      </div>
                      {category.description && (
                        <p className="mt-0.5 truncate text-xs text-text-secondary">
                          {category.description}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-text-muted">
                        Order: {category.order}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        <Pencil className="h-3 w-3" />
                        {ADMIN_CATEGORIES.editLabel}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.id)}
                        onBlur={() => setConfirmId(null)}
                        disabled={deleteMutation.isPending}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                          confirmId === category.id
                            ? "border-destructive/60 bg-destructive/15 text-destructive"
                            : "border-glass-border bg-glass-bg text-text-secondary hover:border-destructive/50 hover:text-destructive",
                        )}
                      >
                        {deleteMutation.isPending &&
                        confirmId !== category.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        {confirmId === category.id
                          ? ADMIN_CATEGORIES.deleteConfirmLabel
                          : ADMIN_CATEGORIES.deleteLabel}
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
    </div>
  );
}
