export interface Project {
  id: number;
  slug: string;
  title: string;
  description?: string;
  image: string;
  tags: string[];
  link: string;
  role?: string;
  year?: string;
  gallery?: string[];
  highlights?: string[];
}

export interface ProjectCardProps {
  project: Project;
  index: number;
}

export type ProjectsBackgroundProps = Record<string, never>;

export const REPLAY_VIEWPORT = {
  once: false,
  amount: 0.2,
  margin: "0px 0px -100px 0px",
} as const;
