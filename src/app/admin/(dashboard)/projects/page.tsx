import { Suspense } from "react";
import type { Metadata } from "next";
import { ProjectsList } from "@/components/sections/admin-projects";
import { NuqsAdapterLoader } from "@/components/providers/nuqs-adapter-loader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={null}>
      <NuqsAdapterLoader>
        <ProjectsList />
      </NuqsAdapterLoader>
    </Suspense>
  );
}
