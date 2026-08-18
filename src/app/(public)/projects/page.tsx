import { ProjectsGrid } from "@/components/sections/projects";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getEnv } from "@/lib/env";

const env = getEnv();

export const metadata: Metadata = {
  title: `All Projects | ${env.NEXT_PUBLIC_SITE_NAME}`,
  description:
    "Proyek pilihan — portofolio web, dashboard SaaS, dan API yang scalable dengan arsitektur modern.",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });

  return (
    <main className="min-h-screen pt-32 bg-bg-primary">
      <ProjectsGrid projects={projects.map(mapDbProjectToProject)} />
    </main>
  );
}