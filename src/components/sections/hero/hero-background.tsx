import { HeroBackgroundProps } from "./constants";

export function HeroBackground({}: HeroBackgroundProps) {
  return (
    <>
      {/* Minimal background - no heavy effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
    </>
  );
}
