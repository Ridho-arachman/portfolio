import type { ExperienceType } from "@/types/domain";
import type { Messages } from "@/lib/translation-types";

type ExperienceMessages = Messages["experience"];

const TYPE_LABELS: Partial<Record<ExperienceType, (t: ExperienceMessages) => string>> = {
  WORK: (t) => t.type.fullTime,
  INTERNSHIP: (t) => t.type.internship,
  ORGANIZATION: (t) => t.organization,
  FREELANCE: (t) => t.type.freelance,
};

export function experienceTypeLabel(type: ExperienceType, t: ExperienceMessages): string {
  return TYPE_LABELS[type]?.(t) ?? type;
}
