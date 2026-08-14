import type { Metadata } from "next";
import { ProjectsList } from "@/components/sections/admin-projects";

export const metadata: Metadata = {
  title: "Projects",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminProjectsPage() {
  return <ProjectsList />;
}
