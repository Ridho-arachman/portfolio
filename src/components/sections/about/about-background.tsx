import { AboutBackgroundProps } from "./constants";

export function AboutBackground({}: AboutBackgroundProps) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-float" />
  );
}
