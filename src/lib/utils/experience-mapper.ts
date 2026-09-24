import { type Experience as PrismaExperience } from "@/generated/prisma/client";
import { type ExperienceType } from "@/types/domain";

const TYPE_MAP: Record<string, ExperienceType> = {
  WORK: "WORK",
  ORGANIZATION: "ORGANIZATION",
  FREELANCE: "FREELANCE",
  EDUCATION: "EDUCATION",
  CERTIFICATION: "CERTIFICATION",
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
  id: string;
  slug: string;
  title: string;
  role: string;
  company: string;
  type: ExperienceType;
  period: string;
  location: string;
  thumbnail: string | null;
  gallery: string[];
  description: string[];
  isPublished: boolean;
  order: number;
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
    id: exp.id,
    slug: exp.slug,
    title: exp.title,
    role: exp.title,
    company: exp.company,
    type: TYPE_MAP[exp.type] ?? "WORK",
    period: `${periodStart} - ${periodEnd}`,
    location: exp.location,
    thumbnail: exp.thumbnail,
    gallery: exp.gallery,
    description: exp.description,
    isPublished: exp.isPublished,
    order: exp.order,
  };
}

export function mapExperiences(exps: PrismaExperience[]): MappedExperience[] {
  return exps.map((exp, i) => mapExperience(exp, i));
}
