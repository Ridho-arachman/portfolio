import { type Variants } from "framer-motion";

export interface Experience {
  id: number;
  slug: string;
  role: string;
  company: string;
  type: "Work" | "Organization" | "Freelance";
  period: string;
  location: string;
  thumbnail: string;
  gallery: string[];
  description: string[];
}

export interface ExperienceCardProps {
  exp: Experience;
  index: number;
  isLeft: boolean;
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const REPLAY_VIEWPORT = {
  once: false,
  amount: 0.2,
} as const;
