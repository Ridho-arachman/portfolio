import { type ExperienceType } from "@/types/domain";

export interface ExperienceListData {
  id: string;
  slug: string;
  role: string;
  company: string;
  type: ExperienceType;
  period: string;
  location: string;
  thumbnail: string | null;
  gallery?: string[];
  description: string[];
}

export interface ExperienceListItemProps {
  exp: ExperienceListData;
  index?: number;
}
