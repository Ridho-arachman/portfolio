import prisma from "@/lib/prisma";
import { mapExperiences } from "@/lib/utils/experience-mapper";
import { ExperienceListItem } from "@/components/sections/experience-list/experience-list-item";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Experiences | Ridho.dev",
  description:
    "Daftar lengkap pengalaman profesional, peran kepemimpinan, dan pencapaian saya.",
};

export default async function ExperienceListPage() {
  const rawExperiences = await prisma.experience.findMany({
    orderBy: { order: "asc" },
  });
  const experiences = mapExperiences(rawExperiences);

  return (
    <main className="min-h-screen pt-32 pb-20 bg-bg-primary">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            All <span className="text-gradient-elegant">Experiences</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            A comprehensive look at my professional journey, leadership roles,
            and the impact I&apos;ve made.
          </p>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiences.map((exp, index) => (
            <ExperienceListItem key={exp.id} exp={exp} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
