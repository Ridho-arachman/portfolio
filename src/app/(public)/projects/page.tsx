import { ProjectsPageContent } from "./projects-content";
import prisma from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { unstable_cache } from "next/cache";

export const metadata = buildMetadata({
  title: "Projects",
  description:
    "Proyek pilihan — portofolio web, dashboard SaaS, dan API yang scalable dengan arsitektur modern.",
  path: "/projects",
});

export const revalidate = 3600;

const getProjects = unstable_cache(
  async () => {
    return prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });
  },
  ["public-projects"],
  { revalidate: 3600, tags: ["projects"] },
);

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsPageContent projects={projects} />;
}
