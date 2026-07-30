import { type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Lightbulb, Shield, Users, Zap } from "lucide-react";

export interface CoreValue {
  icon: LucideIcon;
  title: string;
  desc: string;
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
    title: "Performance First",
    desc: "Saya percaya website yang cepat adalah hak pengguna, bukan fitur tambahan. Optimasi adalah prioritas.",
  },
  {
    icon: Shield,
    title: "Type-Safe & Reliable",
    desc: "Menggunakan TypeScript dan testing untuk memastikan kode yang scalable dan minim bug di production.",
  },
  {
    icon: Users,
    title: "User-Centric Design",
    desc: "Teknologi yang hebat tidak ada artinya jika tidak mudah digunakan. UX selalu menjadi panduan utama.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Learning",
    desc: "Dunia tech bergerak cepat. Saya selalu meluangkan waktu untuk mempelajari arsitektur dan tools terbaru.",
  },
];

export const REPLAY_VIEWPORT = {
  once: false,
  amount: 0.2,
} as const;
