import { ProjectsGrid } from "@/components/sections/projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Projects | Ridho.dev",
  description:
    "Proyek pilihan — portofolio web, dashboard SaaS, dan API yang scalable dengan arsitektur modern.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen pt-32 bg-bg-primary">
      <ProjectsGrid />
    </main>
  );
}