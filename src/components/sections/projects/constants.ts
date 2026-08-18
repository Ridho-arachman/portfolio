import { type MotionValue, type Variants } from "framer-motion";

export interface Project {
  id: number;
  slug: string;
  title: string;
  description: string;
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

export interface ProjectsBackgroundProps {
  bgY1: MotionValue<number>;
  bgY2: MotionValue<number>;
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const REPLAY_VIEWPORT = {
  once: false,
  amount: 0.2,
  margin: "0px 0px -100px 0px",
} as const;