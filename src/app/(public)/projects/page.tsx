import { PageHeader } from "@/components/ui/page-header";
import { ProjectCard } from "@/components/sections/projects";
import { FEATURED_PROJECTS } from "@/components/sections/projects/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Projects | Ridho.dev",
  description:
    "Proyek pilihan — portofolio web, dashboard SaaS, dan API yang scalable dengan arsitektur modern.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <PageHeader
        title="All Projects"
        subtitle="Proyek pilihan yang menunjukkan arsitektur scalable, UI imersif, dan praktik engineering yang solid."
        breadcrumb="Portfolio"
      />

      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_PROJECTS.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
}