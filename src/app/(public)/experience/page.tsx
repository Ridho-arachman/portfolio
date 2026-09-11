import { ExperiencePageContent } from "./experience-content";
import prisma from "@/lib/prisma";
import { mapExperiences } from "@/lib/utils/experience-mapper";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Experience",
  description:
    "Daftar lengkap pengalaman profesional, peran kepemimpinan, dan pencapaian saya.",
  path: "/experience",
});

export const dynamic = "force-dynamic";

export default async function ExperienceListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const PAGE_SIZE = 6;

  const [rawExperiences, total] = await Promise.all([
    prisma.experience.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.experience.count({ where: { isPublished: true } }),
  ]);

  const experiences = mapExperiences(rawExperiences);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return <ExperiencePageContent experiences={experiences} page={page} totalPages={totalPages} />;
}
