import { type Experience as PrismaExperience } from "@/generated/prisma/client";
import { localizeExperience } from "@/lib/localized-content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { type ExperienceType } from "@/types/domain";

const TYPE_MAP: Record<string, ExperienceType> = {
  WORK: "WORK",
  INTERNSHIP: "INTERNSHIP",
  ORGANIZATION: "ORGANIZATION",
  FREELANCE: "FREELANCE",
  EDUCATION: "EDUCATION",
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

export function formatExperiencePeriod(
  startDate: Date | string,
  endDate: Date | string | null | undefined,
  isCurrent: boolean,
): string {
  const end = isCurrent || !endDate ? "Present" : formatDate(new Date(endDate));
  return `${formatDate(new Date(startDate))} - ${end}`;
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
  locale: Locale = DEFAULT_LOCALE,
): MappedExperience {
  const period = formatExperiencePeriod(exp.startDate, exp.endDate, exp.isCurrent);
  const localized = localizeExperience(exp, locale);

  return {
    id: exp.id,
    slug: exp.slug,
    title: localized.title,
    role: localized.title,
    company: exp.company,
    type: TYPE_MAP[exp.type] ?? "WORK",
    period,
    location: exp.location,
    thumbnail: exp.thumbnail,
    gallery: exp.gallery,
    description: localized.description,
    isPublished: exp.isPublished,
    order: exp.order,
  };
}

export function mapExperiences(
  exps: PrismaExperience[],
  locale: Locale = DEFAULT_LOCALE,
): MappedExperience[] {
  return exps.map((exp) => mapExperience(exp, locale));
}
