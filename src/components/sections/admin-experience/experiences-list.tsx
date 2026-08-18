"use client";

import {
  Briefcase,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  useAdminExperiences,
  useDeleteExperience,
} from "@/hooks/use-experience";
import {
  ADMIN_EXPERIENCE,
  EXPERIENCE_TYPES,
} from "./constants";

function typeBadgeClass(type: string) {
  return (
    EXPERIENCE_TYPES.find((item) => item.value === type)?.badgeClass ??
    "bg-accent-muted text-accent"
  );
}

export function ExperiencesList() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { data, isLoading, error } = useAdminExperiences();
  const deleteMutation = useDeleteExperience();

  const experiences = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? experiences.filter(
          (experience) =>
            experience.role.toLowerCase().includes(q) ||
            experience.company.toLowerCase().includes(q) ||
            experience.type.toLowerCase().includes(q) ||
            experience.location.toLowerCase().includes(q),
        )
      : experiences;

    return [...list].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [experiences, query]);

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
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ADMIN_EXPERIENCE.title}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_EXPERIENCE.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/experience/new"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-bg-primary transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
            >
              <Plus className="h-3.5 w-3.5" />
              {ADMIN_EXPERIENCE.addLabel}
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
                placeholder={ADMIN_EXPERIENCE.searchPlaceholder}
                className="w-full rounded-xl border border-glass-border bg-bg-primary/60 py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent/50"
              />
            </div>
          </div>

          {!mounted || isLoading ? (
            <div className="space-y-4 p-4 sm:p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-destructive">Error loading experiences</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {(error as Error).message || "Something went wrong"}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{ADMIN_EXPERIENCE.emptyTitle}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {ADMIN_EXPERIENCE.emptyNote}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-glass-border/60">
              {filtered.map((experience) => (
                <li key={experience.id}>
                  <div className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/5 sm:px-5">
                    <Image
                      src={experience.thumbnail}
                      alt={experience.role}
                      width={320}
                      height={224}
                      unoptimized
                      className="hidden h-14 w-20 shrink-0 rounded-lg border border-glass-border object-cover sm:block"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {experience.role}
                        </p>
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            typeBadgeClass(experience.type),
                          )}
                        >
                          {experience.type}
                        </span>
                      </div>
                      <p className="truncate text-xs text-text-secondary">
                        {experience.company} · {experience.location}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-muted">
                        <span>{experience.period}</span>
                        <span>
                          {experience.description.length}{" "}
                          {experience.description.length === 1
                            ? "achievement"
                            : "achievements"}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/admin/experience/${experience.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        <Pencil className="h-3 w-3" />
                        {ADMIN_EXPERIENCE.editLabel}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(experience.id)}
                        onBlur={() => setConfirmId(null)}
                        disabled={deleteMutation.isPending}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                          confirmId === experience.id
                            ? "border-destructive/60 bg-destructive/15 text-destructive"
                            : "border-glass-border bg-glass-bg text-text-secondary hover:border-destructive/50 hover:text-destructive",
                        )}
                      >
                        {deleteMutation.isPending && confirmId === experience.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        {confirmId === experience.id
                          ? ADMIN_EXPERIENCE.deleteConfirmLabel
                          : ADMIN_EXPERIENCE.deleteLabel}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-text-muted">
          {ADMIN_EXPERIENCE.mockNote}
        </p>
      </main>
    </div>
  );
}
