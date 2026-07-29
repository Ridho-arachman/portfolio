import {
  type MotionValue,
  type Variants,
  type ViewportOptions,
} from "framer-motion";
import { Code2, Database, Globe } from "lucide-react";

export interface AboutAvatarProps {
  avatarY: MotionValue<number>;
}

export interface AboutBackgroundProps {
  blobY: MotionValue<number>;
}

export interface AboutContentProps {
  textY: MotionValue<number>;
}

export interface AvatarBackgroundProps {
  bgX: MotionValue<number>;
  bgY: MotionValue<number>;
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export const contentVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: 0.1, ease: "easeOut" },
  },
};

export const REPLAY_VIEWPORT: ViewportOptions = {
  once: false,
  amount: 0.2,
  margin: "0px 0px -100px 0px",
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export const marqueeVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const HIGHLIGHT_POINTS = [
  {
    icon: Code2,
    title: "Clean Code",
    desc: "Type-safe & Maintainable",
  },
  {
    icon: Globe,
    title: "Web Performance",
    desc: "Optimized & Fast",
  },
  {
    icon: Database,
    title: "Data Driven",
    desc: "Scalable Architecture",
  },
] as const;
