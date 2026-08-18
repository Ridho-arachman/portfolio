import type { Experience as PrismaExperience } from "@/generated/prisma/client";

type ExperienceTypeLabel = "Work" | "Organization" | "Freelance";

const TYPE_MAP: Record<string, ExperienceTypeLabel> = {
  WORK: "Work",
  ORGANIZATION: "Organization",
  FREELANCE: "Freelance",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export interface MappedExperience {
  id: number;
  slug: string;
  role: string;
  company: string;
  type: ExperienceTypeLabel;
  period: string;
  location: string;
  thumbnail: string;
  gallery: string[];
  description: string[];
}

export function mapExperience(
  exp: PrismaExperience,
  index: number,
): MappedExperience {
  const startDate = new Date(exp.startDate);
  const endDate = exp.endDate ? new Date(exp.endDate) : null;

  const periodStart = formatDate(startDate);
  const periodEnd = exp.isCurrent ? "Present" : endDate ? formatDate(endDate) : "Present";

  return {
    id: index + 1,
    slug: exp.slug,
    role: exp.title,
    company: exp.company,
    type: TYPE_MAP[exp.type] ?? "Work",
    period: `${periodStart} - ${periodEnd}`,
    location: exp.location,
    thumbnail: exp.thumbnail ?? "",
    gallery: exp.gallery,
    description: exp.description,
  };
}

export function mapExperiences(exps: PrismaExperience[]): MappedExperience[] {
  return exps.map((exp, i) => mapExperience(exp, i));
}
