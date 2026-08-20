"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Award,
  Loader2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ADMIN_CERTIFICATES } from "./constants";
import { useAdminCertificates, useDeleteCertificate } from "@/hooks/use-certificates";
import { usePagination } from "@/hooks/use-pagination";
import { Pagination } from "@/components/ui/pagination";
import type { AdminCertificate } from "./constants";

export function CertificatesList() {
  const [mounted, setMounted] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { page, search, setSearch, goToPage, paginationParams } =
    usePagination({ defaultPageSize: 10 });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { data, isLoading, isError } = useAdminCertificates(paginationParams);
  const deleteMutation = useDeleteCertificate();

  const certificates: AdminCertificate[] = (data?.data as AdminCertificate[]) ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const filtered = useMemo(() => {
    return [...certificates].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [certificates]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ADMIN_CERTIFICATES.title}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_CERTIFICATES.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/certificates/new"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-bg-primary transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
            >
              <Plus className="h-3.5 w-3.5" />
              {ADMIN_CERTIFICATES.addLabel}
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
                placeholder={ADMIN_CERTIFICATES.searchPlaceholder}
                className="w-full rounded-xl border border-glass-border bg-bg-primary/60 py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent/50"
              />
            </div>
          </div>

          {!mounted || isLoading ? (
            <div className="space-y-4 p-4 sm:p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Failed to load certificates</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Please try again later.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">
                {ADMIN_CERTIFICATES.emptyTitle}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {ADMIN_CERTIFICATES.emptyNote}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-glass-border/60">
              {filtered.map((certificate) => (
                <li key={certificate.id}>
                  <div className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/5 sm:px-5">
                    <Image
                      src={certificate.thumbnail}
                      alt={certificate.title}
                      width={320}
                      height={224}
                      unoptimized
                      className="hidden h-14 w-20 shrink-0 rounded-lg border border-glass-border object-cover sm:block"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {certificate.title}
                        </p>
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            certificate.isPublished
                              ? "bg-accent-muted text-accent"
                              : "bg-white/5 text-text-muted",
                          )}
                        >
                          {certificate.isPublished
                            ? ADMIN_CERTIFICATES.publishedLabel
                            : ADMIN_CERTIFICATES.draftLabel}
                        </span>
                        {certificate.credentialId && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                            <ShieldCheck className="h-3 w-3" />
                            {ADMIN_CERTIFICATES.verifiedLabel}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-text-secondary">
                        {certificate.issuer}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-muted">
                        <span>{certificate.period}</span>
                        {certificate.skills.length > 0 && (
                          <span className="flex flex-wrap gap-1">
                            {certificate.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-white/5 px-2 py-0.5 text-text-secondary"
                              >
                                {skill}
                              </span>
                            ))}
                            {certificate.skills.length > 3 && (
                              <span className="rounded-full bg-white/5 px-2 py-0.5">
                                +{certificate.skills.length - 3}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/admin/certificates/${certificate.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        <Pencil className="h-3 w-3" />
                        {ADMIN_CERTIFICATES.editLabel}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(certificate.id)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-destructive/50 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        {ADMIN_CERTIFICATES.deleteLabel}
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

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ADMIN_CERTIFICATES.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {ADMIN_CERTIFICATES.deleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                ADMIN_CERTIFICATES.deleteConfirmLabel
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
