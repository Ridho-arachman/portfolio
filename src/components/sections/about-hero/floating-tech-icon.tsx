"use client";

import { FloatingTechIconProps } from "./constants";

export function FloatingTechIcon({
  icon: Icon,
  className,
}: FloatingTechIconProps) {
  return (
    <div className={className}>
      <div
        className="p-4 rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-xl pointer-events-none animate-float-gentle"
      >
        <Icon className="w-8 h-8 text-accent/60" />
      </div>
    </div>
  );
}