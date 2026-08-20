import { TrendingUp } from "lucide-react";
import * as m from "motion/react-m";
import type { Variants } from "motion/react";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "./constants";

export const STAT_CARD_ITEM: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const toneClasses = {
  up: "bg-accent-muted text-accent",
  neutral: "bg-white/5 text-text-secondary",
} as const;

export function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon;
  const tone = stat.tone ?? "neutral";

  return (
    <m.div
      variants={STAT_CARD_ITEM}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl p-5 transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(167,139,250,0.12)]",
        stat.accent && "border-accent/40 bg-accent/10 shadow-[0_0_40px_rgba(167,139,250,0.15)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "w-11 h-11 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            stat.accent
              ? "border-accent bg-accent text-bg-primary"
              : "bg-accent/10 border-accent/25 text-accent",
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            toneClasses[tone],
          )}
        >
          {tone === "up" && <TrendingUp className="w-3.5 h-3.5" />}
          {stat.delta}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
        <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
      </div>
    </m.div>
  );
}
