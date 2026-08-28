import { ExperienceDetail } from "@/components/sections/experience-detail";
import prisma from "@/lib/prisma";
import { buildMetadata, buildNotFoundMetadata } from "@/lib/seo";
import { mapExperiences, mapExperience } from "@/lib/utils/experience-mapper";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ExperienceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const experiences = await prisma.experience.findMany({
      select: { slug: true },
    });
    return experiences.map((exp) => ({ slug: exp.slug }));
  } catch {
    // Hermetic build fallback: saat database tidak terjangkau (mis. CI build
    // tanpa DB), lewahkan pra-render params dan biarkan halaman dirender
    // on-demand alih-alih menggagalkan `next build`.
    return [];
  }
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
    return buildNotFoundMetadata("Experience");
  }

  return buildMetadata({
    title: `${experience.title} — ${experience.company}`,
    description: `Detail pengalaman ${experience.title} di ${experience.company}.`,
    path: `/experience/${slug}`,
  });
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
