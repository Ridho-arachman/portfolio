"use client";

import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/use-pagination";
import { usePurgeFromTrash, useRestoreFromTrash, useTrash } from "@/hooks/use-trash";
import { AlertCircle, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ADMIN_TRASH,
  TRASH_ENTITIES,
  TRASH_ENTITY_KEYS,
  type TrashEntityKey,
} from "./constants";
import { TrashRowItem } from "./trash-row";
import "nuqs/adapters/next";

export function TrashList() {
  const [entity, setEntity] = useState<TrashEntityKey>("projects");
  const [purgeId, setPurgeId] = useState<string | null>(null);
  const { page, search, setSearch, goToPage, resetPage, paginationParams } =
    usePagination({ defaultPageSize: 10 });

  const { data, isLoading, isError, refetch } = useTrash(entity, paginationParams);
  const restoreMutation = useRestoreFromTrash();
  const purgeMutation = usePurgeFromTrash();

  const rows = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const isBusy = restoreMutation.isPending || purgeMutation.isPending;
  const hasFilter = search.trim() !== "";

  const handleEntityChange = (next: TrashEntityKey) => {
    setEntity(next);
    // Halaman 3 dari Projects belum tentu ada di Skills, jadi jangan biarkan
    // tab carries a page number yang tidak valid.
    resetPage();
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ADMIN_TRASH.title}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_TRASH.subtitle}
              </p>
            </div>
          </div>
          <p className="text-xs text-text-muted">{ADMIN_TRASH.actionNote}</p>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
          <div className="border-b border-glass-border p-4 sm:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {TRASH_ENTITY_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleEntityChange(key)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                      entity === key
                        ? "bg-accent text-bg-primary"
                        : "border border-glass-border bg-glass-bg text-text-secondary hover:text-accent",
                    )}
                  >
                    {TRASH_ENTITIES[key].label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={ADMIN_TRASH.searchPlaceholder}
                  className="w-full rounded-xl border border-glass-border bg-bg-primary/60 py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent/50"
                />
              </div>
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
              <h3 className="font-semibold">{ADMIN_TRASH.errorTitle}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {ADMIN_TRASH.errorNote}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
              >
                {ADMIN_TRASH.retryLabel}
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">
                {hasFilter
                  ? ADMIN_TRASH.emptyFilteredTitle
                  : ADMIN_TRASH.emptyTitle}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {hasFilter ? ADMIN_TRASH.emptyFilteredNote : ADMIN_TRASH.emptyNote}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-glass-border/60">
              {rows.map((row) => (
                <TrashRowItem
                  key={row.id}
                  row={row}
                  entity={TRASH_ENTITIES[entity]}
                  isPending={isBusy}
                  onRestore={(id) =>
                    restoreMutation.mutate({ entity, id })
                  }
                  onPurge={setPurgeId}
                />
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
        open={purgeId !== null}
        title={ADMIN_TRASH.purgeConfirmTitle}
        description={ADMIN_TRASH.purgeConfirmDescription}
        confirmLabel={ADMIN_TRASH.purgeConfirmLabel}
        isPending={purgeMutation.isPending}
        onConfirm={() => {
          if (purgeId) purgeMutation.mutate({ entity, id: purgeId });
        }}
        onClose={() => setPurgeId(null)}
      />
    </div>
  );
}
