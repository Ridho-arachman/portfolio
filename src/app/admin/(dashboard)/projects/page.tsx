import { NuqsAdapterLoader } from "@/components/providers/nuqs-adapter-loader";
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
    <NuqsAdapterLoader>
      <AdminProjectsPageClient />
    </NuqsAdapterLoader>
  );
}
