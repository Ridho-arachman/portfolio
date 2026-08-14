import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "./constants";

const toneClasses = {
  up: "bg-accent-muted text-accent",
  neutral: "bg-white/5 text-text-secondary",
} as const;

export function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon;
  const tone = stat.tone ?? "neutral";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl p-5 transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(167,139,250,0.12)]",
        stat.accent && "border-accent/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent transition-transform duration-300 group-hover:scale-110">
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
    </div>
  );
}
