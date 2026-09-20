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

const getExperiences = unstable_cache(
  async () => {
    return prisma.experience.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });
  },
  ["public-experiences"],
  { revalidate: 3600, tags: ["experiences"] },
);

export default async function ExperienceListPage() {
  const rawExperiences = await getExperiences();
  const experiences = mapExperiences(rawExperiences);

  return <ExperiencePageContent experiences={experiences} />;
}
