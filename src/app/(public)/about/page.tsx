import { AboutPageContent } from "./about-content";
import prisma from "@/lib/prisma";
import { mapExperiences } from "@/lib/utils/experience-mapper";
import { buildMetadata } from "@/lib/seo";
import { unstable_cache } from "next/cache";

export const metadata = buildMetadata({
  title: "About Me",
  description:
    "Learn more about my background, core values, experience, and the technologies I work with.",
  path: "/about",
});

export const revalidate = 3600;

const getExperiences = unstable_cache(
  async () => prisma.experience.findMany({ orderBy: { order: "asc" } }),
  ["about-experiences"],
  { revalidate: 3600, tags: ["experiences"] },
);

export default async function AboutPage() {
  const rawExperiences = await getExperiences();
  const experiences = mapExperiences(rawExperiences);

  return <AboutPageContent experiences={experiences} />;
}
