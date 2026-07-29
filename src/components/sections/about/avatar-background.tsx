import * as m from "motion/react-m";
import { AvatarBackgroundProps } from "./constants";

export function AvatarBackground({ bgX, bgY }: AvatarBackgroundProps) {
  return (
    <m.div
      style={{ x: bgX, y: bgY }}
      className="absolute inset-0 pointer-events-none"
    >
      {/* Glowing Orb Top Right */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl" />
      {/* Glowing Orb Bottom Left */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl" />

      {/* Floating Tech Shapes */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
      <div
        className="absolute bottom-20 right-16 w-1.5 h-1.5 bg-purple-300/50 rounded-full animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div className="absolute top-1/2 -right-4 w-3 h-3 border border-purple-400/50 rotate-45" />
    </m.div>
  );
}
