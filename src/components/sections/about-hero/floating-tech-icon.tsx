import { useSpring, useTransform } from "framer-motion";
import * as m from "motion/react-m";
import { FloatingTechIconProps } from "./constants";

export function FloatingTechIcon({
  icon: Icon,
  mouseX,
  mouseY,
  intensity = 20,
  floatDuration = 4,
  scrollY,
  scrollIntensity = 0,
  className,
}: FloatingTechIconProps) {
  const springConfig = { damping: 20, stiffness: 100 };

  const mouseParallaxX = useSpring(
    useTransform(mouseX, [-1, 1], [-intensity, intensity]),
    springConfig,
  );
  const mouseParallaxY = useSpring(
    useTransform(mouseY, [-1, 1], [-intensity, intensity]),
    springConfig,
  );
  const scrollParallaxY = useTransform(scrollY, [0, 1], [0, -scrollIntensity]);

  return (
    <m.div
      style={{ x: mouseParallaxX, y: scrollParallaxY }}
      className={className}
    >
      <m.div
        animate={{ y: [0, -12, 0] }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ y: mouseParallaxY }}
        className="p-4 rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-xl pointer-events-none"
      >
        <Icon className="w-8 h-8 text-accent/60" />
      </m.div>
    </m.div>
  );
}
