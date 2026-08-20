"use client";

import { AlertTriangle, ArrowLeft, FolderTree } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ADMIN_CATEGORIES } from "./constants";
import { CategoryForm } from "./category-form";
import {
  useAdminCategory,
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import type { AdminCategory } from "./constants";

export function CategoryFormPage({
  mode,
  categoryId,
}: {
  mode: "create" | "edit";
  categoryId?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const {
    data: category,
    isLoading: isLoadingCategory,
    isError: isCategoryError,
  } = useAdminCategory(mode === "edit" ? categoryId ?? "" : "");
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isLoading = mode === "edit" && isLoadingCategory;
  const categoryData = category as AdminCategory | undefined;

  if (!mounted || isLoading) {
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

  if (mode === "edit" && isCategoryError) {
    return (
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">Failed to load category</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Please try again later.
          </p>
          <Link
            href="/admin/categories"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            {ADMIN_CATEGORIES.backLabel}
          </Link>
        </main>
      </div>
    );
  }

  if (mode === "edit" && !categoryData) {
    return (
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <FolderTree className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">
            {ADMIN_CATEGORIES.notFoundTitle}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {ADMIN_CATEGORIES.notFoundNote}
          </p>
          <Link
            href="/admin/categories"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            {ADMIN_CATEGORIES.backLabel}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <CategoryForm
      key={categoryData?.id ?? "create"}
      mode={mode}
      initialData={categoryData}
      isLoading={createMutation.isPending || updateMutation.isPending}
      onSubmit={
        mode === "edit" && categoryData
          ? (data) => updateMutation.mutate({ id: categoryData.id, data })
          : (data) => createMutation.mutate(data)
      }
    />
  );
}
