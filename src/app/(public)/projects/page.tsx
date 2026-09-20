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

const PAGE_SIZE = 6;

const getProjectsPage = unstable_cache(
  async (page: number) => {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { isPublished: true },
        orderBy: { order: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.project.count({ where: { isPublished: true } }),
    ]);
    return { projects, total };
  },
  ["public-projects"],
  { revalidate: 3600, tags: ["projects"] },
);

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { projects, total } = await getProjectsPage(page);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return <ProjectsPageContent projects={projects} page={page} totalPages={totalPages} />;
}
