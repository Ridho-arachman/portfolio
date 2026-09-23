import { type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Lightbulb, Shield, Users, Zap } from "lucide-react";

export interface CoreValue {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

export interface ValueCardProps {
  value: CoreValue;
  index: number;
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const CORE_VALUES: CoreValue[] = [
  {
    icon: Zap,
    titleKey: "performanceFirst",
    descKey: "performanceFirstDesc",
  },
  {
    icon: Shield,
    titleKey: "typeSafe",
    descKey: "typeSafeDesc",
  },
  {
    icon: Users,
    titleKey: "userCentric",
    descKey: "userCentricDesc",
  },
  {
    icon: Lightbulb,
    titleKey: "continuousLearning",
    descKey: "continuousLearningDesc",
  },
];

export const REPLAY_VIEWPORT = {
  once: true,
  amount: 0.2,
} as const;
