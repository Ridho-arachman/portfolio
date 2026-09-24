"use client";

import { Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function AvatarBadge() {
  const { t } = useTranslation();
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-max p-3 rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-purple-500/30 shadow-2xl animate-float-gentle" style={{ transform: "translateZ(40px)" }}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          <Sparkles size={18} className="animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-wide">
            {t.about.badgeAvailable}
          </p>
          <p className="text-xs text-gray-400 font-medium">
            {t.about.badgeOpen}
          </p>
        </div>
      </div>
    </div>
  );
}