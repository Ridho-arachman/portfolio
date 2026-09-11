import { AboutPageContent } from "./about-content";
import prisma from "@/lib/prisma";
import { mapExperiences } from "@/lib/utils/experience-mapper";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Me",
  description:
    "Learn more about my background, core values, experience, and the technologies I work with.",
  path: "/about",
});

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const rawExperiences = await prisma.experience.findMany({
    orderBy: { order: "asc" },
  });
  const experiences = mapExperiences(rawExperiences);

  return <AboutPageContent experiences={experiences} />;
}
