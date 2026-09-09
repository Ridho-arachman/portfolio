"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryFormPage = dynamic(
  () => import("@/components/sections/admin-categories").then((mod) => mod.CategoryFormPage),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-glass-border bg-bg-primary/80 px-4 py-5 sm:px-8">
          <Skeleton className="h-8 w-52 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-64 rounded-lg" />
        </header>
        <main className="p-4 sm:p-8">
          <Skeleton className="h-80 rounded-2xl" />
        </main>
      </div>
    ),
  }
);

export function CategoryFormPageWrapper({ mode, categoryId }: { mode: "create" | "edit"; categoryId?: string }) {
  return <CategoryFormPage mode={mode} categoryId={categoryId} />;
}