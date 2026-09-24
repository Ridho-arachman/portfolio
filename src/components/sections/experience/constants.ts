import { type Variants } from "framer-motion";
import { type ExperiencePublic } from "@/types/domain";

export { type ExperiencePublic as Experience };

export interface ExperienceCardProps {
  exp: ExperiencePublic;
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
