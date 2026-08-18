import { ExperienceDetail } from "@/components/sections/experience-detail";
import prisma from "@/lib/prisma";
import { mapExperiences, mapExperience } from "@/lib/utils/experience-mapper";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ExperienceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const experiences = await prisma.experience.findMany({
    select: { slug: true },
  });
  return experiences.map((exp) => ({ slug: exp.slug }));
}

export async function generateMetadata({
  params,
}: ExperienceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const experience = await prisma.experience.findFirst({
    where: { slug },
    select: { title: true, company: true },
  });

  if (!experience) {
    return { title: "Experience Not Found | Ridho.dev" };
  }

  return {
    title: `${experience.title} at ${experience.company} | Ridho.dev`,
    description: `Detail pengalaman ${experience.title} di ${experience.company}.`,
  };
}

export default async function ExperienceDetailPage({
  params,
}: ExperienceDetailPageProps) {
  const { slug } = await params;

  const rawExperience = await prisma.experience.findFirst({
    where: { slug },
  });

  if (!rawExperience) {
    notFound();
  }

  const exp = mapExperience(rawExperience, 0);

  const allRaw = await prisma.experience.findMany({
    orderBy: { order: "asc" },
  });
  const allMapped = mapExperiences(allRaw);

  const index = allMapped.findIndex((e) => e.slug === slug);
  const prev = index > 0 ? allMapped[index - 1] : null;
  const next = index < allMapped.length - 1 ? allMapped[index + 1] : null;

  return <ExperienceDetail exp={exp} prev={prev} next={next} />;
}
