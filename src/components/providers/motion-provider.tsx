"use client";

import { LazyMotion, domAnimation } from "motion/react";

/**
 * motion/react-m components (m.div and friends) load animation features on
 * demand, so `whileInView` stays inert until a LazyMotion scope registers
 * domAnimation. Without this provider any element starting at
 * `initial={{ opacity: 0 }}` renders at opacity 0 and never animates in.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
