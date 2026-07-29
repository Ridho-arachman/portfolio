import { type MotionValue } from "framer-motion";
import * as m from "motion/react-m";

interface AboutBackgroundProps {
  blobY: MotionValue<number>;
}

export function AboutBackground({ blobY }: AboutBackgroundProps) {
  return (
    <m.div
      style={{ y: blobY }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-accent/5 rounded-full blur-[120px] pointer-events-none"
    />
  );
}
