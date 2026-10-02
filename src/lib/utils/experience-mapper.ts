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

function formatDate(d: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatExperiencePeriod(
  startDate: Date | string,
  endDate: Date | string | null | undefined,
  isCurrent: boolean,
  locale: Locale = DEFAULT_LOCALE,
  presentLabel = "Present",
): string {
  const end =
    isCurrent || !endDate
      ? presentLabel
      : formatDate(new Date(endDate), locale);
  return `${formatDate(new Date(startDate), locale)} - ${end}`;
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
  presentLabel = "Present",
): MappedExperience {
  const period = formatExperiencePeriod(
    exp.startDate,
    exp.endDate,
    exp.isCurrent,
    locale,
    presentLabel,
  );
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
  presentLabel = "Present",
): MappedExperience[] {
  return exps.map((exp) => mapExperience(exp, locale, presentLabel));
}
