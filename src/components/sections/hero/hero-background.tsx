import { type MotionValue } from "framer-motion";
import * as m from "motion/react-m";

interface HeroBackgroundProps {
  bgY: MotionValue<number>;
  bgScale: MotionValue<number>;
  gridY: MotionValue<number>;
  gridOpacity: MotionValue<number>;
}

export function HeroBackground({
  bgY,
  bgScale,
  gridY,
  gridOpacity,
}: HeroBackgroundProps) {
  return (
    <>
      {/* Background Orbs - Elegant Monochrome */}
      <m.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute top-[-10%] left-[-10%] w-150 h-150 md:w-225 md:h-225 bg-accent/10 rounded-full blur-[150px] pointer-events-none"
      />
      <m.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute bottom-[-10%] right-[-10%] w-125 h-125 md:w-200 md:h-200 bg-white/5 rounded-full blur-[150px] pointer-events-none"
      />

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Perspective Grid */}
      <m.div
        style={{ y: gridY, opacity: gridOpacity }}
        className="absolute bottom-0 left-0 right-0 h-[60vh] bg-grid-elegant pointer-events-none"
      />
    </>
  );
}
