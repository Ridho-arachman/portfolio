import { ExperiencePageContent } from "./experience-content";
import prisma from "@/lib/prisma";
import { mapExperiences } from "@/lib/utils/experience-mapper";
import { buildMetadata } from "@/lib/seo";
import { unstable_cache } from "next/cache";

export const metadata = buildMetadata({
  title: "Experience",
  description:
    "Daftar lengkap pengalaman profesional, peran kepemimpinan, dan pencapaian saya.",
  path: "/experience",
});

export const revalidate = 3600;

const PAGE_SIZE = 6;

const getExperiencesPage = unstable_cache(
  async (page: number) => {
    const [rawExperiences, total] = await Promise.all([
      prisma.experience.findMany({
        where: { isPublished: true },
        orderBy: { order: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.experience.count({ where: { isPublished: true } }),
    ]);
    return { rawExperiences, total };
  },
  ["public-experiences"],
  { revalidate: 3600, tags: ["experiences"] },
);

export default async function ExperienceListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { rawExperiences, total } = await getExperiencesPage(page);

  const experiences = mapExperiences(rawExperiences);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return <ExperiencePageContent experiences={experiences} page={page} totalPages={totalPages} />;
}
