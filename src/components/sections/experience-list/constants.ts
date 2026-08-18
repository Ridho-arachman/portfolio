export interface ExperienceListData {
  id: number;
  slug: string;
  role: string;
  company: string;
  type: "Work" | "Organization" | "Freelance";
  period: string;
  location: string;
  thumbnail: string;
  gallery?: string[];
  description: string[];
}

export interface ExperienceListItemProps {
  exp: ExperienceListData;
  index?: number;
}
