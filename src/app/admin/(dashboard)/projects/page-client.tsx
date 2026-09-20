"use client";

import { Suspense } from "react";
import { ProjectsList } from "@/components/sections/admin-projects";
import "nuqs/adapters/next";

export function AdminProjectsPageClient() {
  return (
    <Suspense fallback={null}>
      <ProjectsList />
    </Suspense>
  );
}