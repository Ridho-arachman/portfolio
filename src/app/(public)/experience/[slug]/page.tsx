"use client";

import { ExperienceDetail } from "@/components/sections/experience-detail";
import { EXPERIENCES_LIST } from "@/components/sections/experience-list/constants";
import { getAdjacentExperiences } from "@/components/sections/experience-detail/use-experience-detail";
import { notFound } from "next/navigation";
import { use } from "react";

export default function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const exp = EXPERIENCES_LIST.find((e) => e.slug === slug);

  if (!exp) {
    notFound();
  }

  const { prev, next } = getAdjacentExperiences(EXPERIENCES_LIST, slug);

  return <ExperienceDetail exp={exp} prev={prev} next={next} />;
}