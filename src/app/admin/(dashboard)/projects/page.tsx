import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminProjectsPageClient } from "./page-client";

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
      <AdminProjectsPageClient />
    </Suspense>
  );
}
